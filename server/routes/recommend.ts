import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  RecommendationsRequest,
  RecommendationsResponse,
  RecommendationMatch,
} from "../../shared/api";

// Validation schema
const RecommendationRequestSchema = z
  .object({
    profileId: z.string().optional(),
    profile: z
      .object({
        name: z.string(),
        educationLevel: z.enum([
          "TENTH_PLUS_TWO",
          "DIPLOMA",
          "UNDERGRADUATE",
          "POSTGRADUATE",
        ]),
        major: z.string().optional(),
        stream: z.string().optional(),
        skills: z.array(z.string()),
        sectorInterests: z.array(z.string()),
        preferredLocations: z.array(z.string()),
        residencyPin: z.string().optional(),
        ruralFlag: z.boolean(),
      })
      .optional(),
  })
  .refine((data) => data.profileId || data.profile, {
    message: "Either profileId or profile data is required",
  });

// Education level hierarchy for comparison
const EDUCATION_HIERARCHY = {
  TENTH_PLUS_TWO: 1,
  DIPLOMA: 2,
  UNDERGRADUATE: 3,
  POSTGRADUATE: 4,
};

// Jaccard similarity for skills
function jaccardSimilarity(set1: string[], set2: string[]): number {
  const intersection = set1.filter((x) => set2.includes(x)).length;
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

// Tokenize helper
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

// Build candidate tokens with simple weights via duplication
function buildCandidateTokens(profile: any): string[] {
  const tokens: string[] = [];
  const pushWeighted = (value: string | undefined, weight: number) => {
    if (!value) return;
    const parts = tokenize(value);
    for (let i = 0; i < weight; i++) tokens.push(...parts);
  };
  if (Array.isArray(profile.skills)) {
    for (const s of profile.skills) pushWeighted(String(s), 2);
  }
  pushWeighted(profile.stream, 2);
  pushWeighted(profile.major, 1);
  if (Array.isArray(profile.sectorInterests)) {
    for (const s of profile.sectorInterests) pushWeighted(String(s), 1);
  }
  pushWeighted(profile.educationLevel, 1);
  return tokens;
}

// Build internship tokens with weights
function buildInternshipTokens(internship: any): string[] {
  const tokens: string[] = [];
  const pushWeighted = (value: string | undefined, weight: number) => {
    if (!value) return;
    const parts = tokenize(value);
    for (let i = 0; i < weight; i++) tokens.push(...parts);
  };
  if (Array.isArray(internship.requiredSkills)) {
    for (const s of internship.requiredSkills) pushWeighted(String(s), 2);
  }
  pushWeighted(internship.title, 1);
  pushWeighted(internship.sector, 1);
  if (internship.description) {
    const desc = tokenize(internship.description).slice(0, 40).join(" ");
    pushWeighted(desc, 1);
  }
  return tokens;
}

// Build TF map
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

// Build IDF using a corpus of documents
function inverseDocumentFrequency(docs: string[][]): Map<string, number> {
  const N = docs.length;
  const df = new Map<string, number>();
  for (const doc of docs) {
    const uniq = new Set(doc);
    for (const t of uniq) df.set(t, (df.get(t) || 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, d] of df) {
    idf.set(t, Math.log((N + 1) / (d + 1)) + 1);
  }
  return idf;
}

// Build TF-IDF vector
function tfidfVector(
  tokens: string[],
  idf: Map<string, number>,
): Map<string, number> {
  const tf = termFrequency(tokens);
  const vec = new Map<string, number>();
  for (const [t, f] of tf) {
    const w = (idf.get(t) || 1) * f;
    vec.set(t, w);
  }
  return vec;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (const [t, av] of a) {
    a2 += av * av;
    const bv = b.get(t) || 0;
    dot += av * bv;
  }
  for (const [, bv] of b) b2 += bv * bv;
  if (a2 === 0 || b2 === 0) return 0;
  return dot / (Math.sqrt(a2) * Math.sqrt(b2));
}

// Check if location matches (simple pin code proximity)
function locationMatches(
  candidatePin: string | null,
  candidateLocations: string[],
  internshipCity: string | null,
  internshipState: string | null,
  internshipPin: string | null,
  isRemote: boolean,
): number {
  if (isRemote) return 0.5;
  if (!candidatePin || !internshipPin) return 0.1;
  const candidateArea = candidatePin.substring(0, 3);
  const internshipArea = internshipPin.substring(0, 3);
  if (candidateArea === internshipArea) return 1.0;
  const locationString = `${internshipCity}, ${internshipState}`.toLowerCase();
  for (const preferred of candidateLocations) {
    if (
      locationString.includes(preferred.toLowerCase()) ||
      preferred.toLowerCase().includes("remote")
    ) {
      return 0.8;
    }
  }
  return 0.2;
}

// Check sector overlap
function sectorMatches(
  candidateInterests: string[],
  internshipSector: string,
): number {
  const normalizedSector = internshipSector.toLowerCase();
  for (const interest of candidateInterests) {
    if (interest.toLowerCase() === normalizedSector) return 1.0;
    if (
      interest.toLowerCase().includes(normalizedSector) ||
      normalizedSector.includes(interest.toLowerCase())
    )
      return 0.6;
  }
  return 0;
}

// Semantic sector bump based on skills
function semanticSectorBump(skills: string[], sector: string): boolean {
  const sectorKeywords: Record<string, string[]> = {
    it: [
      "javascript",
      "python",
      "java",
      "programming",
      "coding",
      "software",
      "web",
      "react",
      "node",
    ],
    healthcare: [
      "medical",
      "health",
      "biology",
      "nursing",
      "research",
      "data analysis",
    ],
    agriculture: ["farming", "agriculture", "biology", "field work", "rural"],
    education: ["teaching", "content writing", "research", "communication"],
    finance: ["excel", "finance", "accounting", "data analysis", "math"],
  };

  const normalizedSector = sector.toLowerCase();
  const keywords = sectorKeywords[normalizedSector] || [];
  return skills.some((skill) =>
    keywords.some((keyword) => skill.toLowerCase().includes(keyword)),
  );
}

// Calculate inclusion bonus
function inclusionBonus(ruralFlag: boolean, sector: string): number {
  if (!ruralFlag) return 0;
  const ruralFriendlySectors = ["agriculture", "education", "public admin"];
  return ruralFriendlySectors.includes(sector.toLowerCase()) ? 5 : 0;
}

// Build explanation reasons
function buildMatchReasons(
  candidateSkills: string[],
  candidateInterests: string[],
  candidateLocations: string[],
  candidatePin: string | null,
  candidateStream: string | undefined,
  internship: any,
  contentSimilarityScore: number,
  sectorScore: number,
  locationScore: number,
): string[] {
  const reasons: string[] = [];
  const matchingSkills = candidateSkills.filter((skill) =>
    internship.requiredSkills.some((req: any) => req.skill.name === skill),
  );
  if (matchingSkills.length > 0) {
    reasons.push(
      `You have ${matchingSkills.length} of ${internship.requiredSkills.length} required skills: ${matchingSkills.slice(0, 3).join(", ")}`,
    );
  }
  if (candidateStream) {
    const streamTokens = new Set(tokenize(candidateStream));
    const fields = `${internship.sector} ${internship.title}`.toLowerCase();
    const hasOverlap = Array.from(streamTokens).some((t) => fields.includes(t));
    if (hasOverlap) {
      reasons.push(`Aligns with your stream: ${candidateStream}`);
    }
  }
  if (sectorScore > 0.5) {
    reasons.push(
      `Strong match with your interest in ${internship.sector} sector`,
    );
  }
  if (internship.remote) {
    reasons.push("Remote work option available");
  } else if (locationScore > 0.7) {
    reasons.push(
      `Located in your preferred area: ${internship.city}, ${internship.state}`,
    );
  }
  return reasons.slice(0, 3);
}

export const handleRecommend: RequestHandler = async (req, res) => {
  try {
    const validatedData = RecommendationRequestSchema.parse(req.body);

    let candidateProfile: any;
    if (validatedData.profileId) {
      candidateProfile = await db.candidateProfile.findUnique({
        where: { id: validatedData.profileId },
      });
      if (!candidateProfile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }
      candidateProfile.skills = JSON.parse(candidateProfile.skills);
      candidateProfile.sectorInterests = JSON.parse(
        candidateProfile.sectorInterests,
      );
      candidateProfile.preferredLocations = JSON.parse(
        candidateProfile.preferredLocations,
      );
    } else {
      candidateProfile = validatedData.profile!;
    }

    const today = new Date();
    const internships = await db.internship.findMany({
      where: { active: true, deadline: { gte: today } },
      include: { requiredSkills: { include: { skill: true } } },
    });

    const eligibleInternships = internships.filter((internship) => {
      const candidateLevel =
        EDUCATION_HIERARCHY[candidateProfile.educationLevel];
      const requiredLevel = EDUCATION_HIERARCHY[internship.minEducation];
      return candidateLevel >= requiredLevel;
    });

    const candidateTokens = buildCandidateTokens(candidateProfile);
    const internshipDocs = eligibleInternships.map((i) => ({
      id: i.id,
      tokens: buildInternshipTokens({
        requiredSkills: i.requiredSkills.map((rs) => rs.skill.name),
        title: i.title,
        sector: i.sector,
        description: i.description || "",
      }),
    }));
    const idf = inverseDocumentFrequency([
      candidateTokens,
      ...internshipDocs.map((d) => d.tokens),
    ]);
    const candidateVec = tfidfVector(candidateTokens, idf);

    const scoredInternships = eligibleInternships.map((internship) => {
      const requiredSkills = internship.requiredSkills.map(
        (rs) => rs.skill.name,
      );
      const doc = internshipDocs.find((d) => d.id === internship.id)!;
      const internVec = tfidfVector(doc.tokens, idf);
      const contentSim = cosineSimilarity(candidateVec, internVec);
      const contentScore = Math.max(0, Math.min(1, contentSim)) * 70;
      const sectorScore = sectorMatches(
        candidateProfile.sectorInterests,
        internship.sector,
      )
        ? 20
        : semanticSectorBump(candidateProfile.skills, internship.sector)
          ? 8
          : 0;
      const locationScore =
        locationMatches(
          candidateProfile.residencyPin,
          candidateProfile.preferredLocations,
          internship.city,
          internship.state,
          internship.pin,
          internship.remote,
        ) * 15;
      const inclusion = inclusionBonus(
        candidateProfile.ruralFlag,
        internship.sector,
      );
      const totalScore = Math.min(
        100,
        contentScore + sectorScore + locationScore + inclusion,
      );
      const matchReasons = buildMatchReasons(
        candidateProfile.skills,
        candidateProfile.sectorInterests,
        candidateProfile.preferredLocations,
        candidateProfile.residencyPin,
        candidateProfile.stream,
        internship,
        contentScore,
        sectorScore,
        locationScore,
      );
      return {
        internship: {
          id: internship.id,
          title: internship.title,
          sector: internship.sector,
          orgName: internship.orgName,
          description: internship.description,
          stipendMin: internship.stipendMin,
          stipendMax: internship.stipendMax,
          city: internship.city,
          state: internship.state,
          pin: internship.pin,
          remote: internship.remote,
          minEducation:
            internship.minEducation as unknown as import("../../shared/api").EducationLevel,
          applicationUrl: internship.applicationUrl,
          deadline: internship.deadline.toISOString(),
          active: internship.active,
          requiredSkills: requiredSkills,
        },
        score: totalScore,
        matchReasons,
      } as RecommendationMatch;
    });

    scoredInternships.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return (
        new Date(a.internship.deadline).getTime() -
        new Date(b.internship.deadline).getTime()
      );
    });

    // LLM re-ranking of top-K (skills, stream, location, education)
    let reranked: RecommendationMatch[] | null = null;
    try {
      if (process.env.GOOGLE_API_KEY) {
        const K = Math.min(10, scoredInternships.length);
        const topK = scoredInternships.slice(0, K);
        const candidateJSON = {
          educationLevel: candidateProfile.educationLevel,
          stream: candidateProfile.stream || "",
          major: candidateProfile.major || "",
          skills: candidateProfile.skills,
          sectorInterests: candidateProfile.sectorInterests,
          preferredLocations: candidateProfile.preferredLocations,
          residencyPin: candidateProfile.residencyPin || "",
          ruralFlag: Boolean(candidateProfile.ruralFlag),
        };
        const items = topK.map((r) => ({
          id: r.internship.id,
          title: r.internship.title,
          sector: r.internship.sector,
          requiredSkills: r.internship.requiredSkills,
          city: r.internship.city || "",
          state: r.internship.state || "",
          remote: r.internship.remote,
          minEducation: r.internship.minEducation,
          baseScore: Math.round(r.score),
        }));

        const schemaHint = `Return strict JSON: {"items": [{"id": string, "rerankScore": number, "reasons": string[]}]} with the same length/order possibly changed. rerankScore in [0,100].`;
        const prompt = `You are ranking internships for a candidate. Use these criteria in priority order:\n1) Skill overlap and proficiency proxy from requiredSkills\n2) Stream/Major alignment to sector/title\n3) Education: candidate must meet or exceed minEducation\n4) Location: remote preferred if candidate prefers remote; otherwise preferredLocations match or pin proximity\n5) Keep results concise and deterministic.\nInput candidate (JSON):\n${JSON.stringify(candidateJSON)}\nInput items (JSON array):\n${JSON.stringify(items)}\n${schemaHint}\nOnly output JSON.`;

        const { generateJSON } = await import("../lib/gemini");
        type ReRankResponse = {
          items: { id: string; rerankScore: number; reasons?: string[] }[];
        };
        const ai = await generateJSON<ReRankResponse>(prompt, "gemini-1.5-pro");
        const scoreMap = new Map<
          string,
          { score: number; reasons: string[] }
        >();
        for (const it of ai.items || []) {
          if (!it || typeof it.id !== "string") continue;
          const s = Math.max(0, Math.min(100, Number(it.rerankScore)));
          const reasons = Array.isArray(it.reasons)
            ? it.reasons.filter(Boolean).slice(0, 2)
            : [];
          scoreMap.set(it.id, { score: s, reasons });
        }
        // Apply re-ranked scores where available, keep base otherwise
        const withRerank = topK.map((r) => {
          const found = scoreMap.get(r.internship.id);
          if (found) {
            const mergedReasons = [...found.reasons, ...r.matchReasons].slice(
              0,
              3,
            );
            return {
              ...r,
              score: found.score,
              matchReasons: mergedReasons,
            } as RecommendationMatch;
          }
          return r;
        });
        // Sort by rerankScore desc, then deadline asc
        withRerank.sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score;
          return (
            new Date(a.internship.deadline).getTime() -
            new Date(b.internship.deadline).getTime()
          );
        });
        reranked = withRerank;
      }
    } catch (e) {
      // If LLM fails, fall back silently to deterministic ranking
      reranked = null;
    }

    const ranked = reranked ?? scoredInternships;

    // Optional: augment top results with one concise AI reason (keep deterministic if fails)
    try {
      if (process.env.GOOGLE_API_KEY) {
        const { generateText } = await import("../lib/gemini");
        const topForReasons = ranked.slice(0, 5);
        const profileSummary = `Skills: ${candidateProfile.skills.join(", ")} | Interests: ${candidateProfile.sectorInterests.join(", ")} | Locations: ${candidateProfile.preferredLocations.join(", ")}`;
        const list = topForReasons
          .map(
            (r, i) =>
              `${i + 1}. ${r.internship.title} at ${r.internship.orgName} (${r.internship.sector}) [${r.internship.remote ? "Remote" : `${r.internship.city || ""}, ${r.internship.state || ""}`}] — skills: ${r.internship.requiredSkills.join(", ")}`,
          )
          .join("\n");
        const prompt = `Given this candidate: ${profileSummary}\nProvide one short reason (max 12 words) for each of these internships (keep order, one line each, numbered 1..N):\n${list}`;
        const ai = await generateText(prompt, "gemini-2.5-flash");
        const lines = ai
          .split(/\r?\n/)
          .map((l) => l.replace(/^\d+\.?\s*/, "").trim())
          .filter(Boolean);
        for (let i = 0; i < topForReasons.length && i < lines.length; i++) {
          const reason = lines[i];
          if (reason) {
            topForReasons[i].matchReasons = [
              reason,
              ...topForReasons[i].matchReasons,
            ].slice(0, 3);
          }
        }
      }
    } catch (e) {}

    const response: RecommendationsResponse = {
      success: true,
      recommendations: ranked.slice(0, 5),
    };

    res.json(response);
  } catch (error) {
    console.error("Recommendation error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        recommendations: [],
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      recommendations: [],
    });
  }
};
