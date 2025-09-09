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
  // Skills heavily weighted
  if (Array.isArray(profile.skills)) {
    for (const s of profile.skills) pushWeighted(String(s), 2);
  }
  // Stream weighted
  pushWeighted(profile.stream, 2);
  // Major
  pushWeighted(profile.major, 1);
  // Sector interests
  if (Array.isArray(profile.sectorInterests)) {
    for (const s of profile.sectorInterests) pushWeighted(String(s), 1);
  }
  // Education level
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
  // Required skills heavily weighted
  if (Array.isArray(internship.requiredSkills)) {
    for (const s of internship.requiredSkills) pushWeighted(String(s), 2);
  }
  pushWeighted(internship.title, 1);
  pushWeighted(internship.sector, 1);
  // Use a limited set of description tokens to reduce noise
  if (internship.description) {
    const desc = tokenize(internship.description).slice(0, 40).join(" ");
    pushWeighted(desc, 1); // implicitly lower due to truncation
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
function tfidfVector(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = termFrequency(tokens);
  const vec = new Map<string, number>();
  for (const [t, f] of tf) {
    const w = (idf.get(t) || 1) * f;
    vec.set(t, w);
  }
  return vec;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
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
  if (isRemote) return 0.5; // Remote gets half points

  if (!candidatePin || !internshipPin) return 0.1; // Small benefit if no pin info

  // Simple proximity check - same first 3 digits of pin
  const candidateArea = candidatePin.substring(0, 3);
  const internshipArea = internshipPin.substring(0, 3);

  if (candidateArea === internshipArea) return 1.0;

  // Check if preferred locations match city/state
  const locationString = `${internshipCity}, ${internshipState}`.toLowerCase();
  for (const preferred of candidateLocations) {
    if (
      locationString.includes(preferred.toLowerCase()) ||
      preferred.toLowerCase().includes("remote")
    ) {
      return 0.8;
    }
  }

  return 0.2; // Different area, small score
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

  // Skills match
  const matchingSkills = candidateSkills.filter((skill) =>
    internship.requiredSkills.some((req: any) => req.skill.name === skill),
  );

  if (matchingSkills.length > 0) {
    reasons.push(
      `You have ${matchingSkills.length} of ${internship.requiredSkills.length} required skills: ${matchingSkills.slice(0, 3).join(", ")}`,
    );
  }

  // Stream alignment
  if (candidateStream) {
    const streamTokens = new Set(tokenize(candidateStream));
    const fields = `${internship.sector} ${internship.title}`.toLowerCase();
    const hasOverlap = Array.from(streamTokens).some((t) => fields.includes(t));
    if (hasOverlap) {
      reasons.push(`Aligns with your stream: ${candidateStream}`);
    }
  }

  // Sector match
  if (sectorScore > 0.5) {
    reasons.push(
      `Strong match with your interest in ${internship.sector} sector`,
    );
  }

  // Location match
  if (internship.remote) {
    reasons.push("Remote work option available");
  } else if (locationScore > 0.7) {
    reasons.push(
      `Located in your preferred area: ${internship.city}, ${internship.state}`,
    );
  }

  return reasons.slice(0, 3); // Max 3 reasons
}

export const handleRecommend: RequestHandler = async (req, res) => {
  try {
    const validatedData = RecommendationRequestSchema.parse(req.body);

    let candidateProfile;

    // Get profile data
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

      // Parse JSON fields
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

    // Get active internships with required skills
    const today = new Date();
    const internships = await db.internship.findMany({
      where: {
        active: true,
        deadline: {
          gte: today,
        },
      },
      include: {
        requiredSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Filter by education level
    const eligibleInternships = internships.filter((internship) => {
      const candidateLevel =
        EDUCATION_HIERARCHY[candidateProfile.educationLevel];
      const requiredLevel = EDUCATION_HIERARCHY[internship.minEducation];
      return candidateLevel >= requiredLevel;
    });

    // Precompute content-based vectors (TF-IDF)
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

    // Score each internship
    const scoredInternships = eligibleInternships.map((internship) => {
      const requiredSkills = internship.requiredSkills.map(
        (rs) => rs.skill.name,
      );

      // Content-based similarity using TF-IDF (0-70)
      const doc = internshipDocs.find((d) => d.id === internship.id)!;
      const internVec = tfidfVector(doc.tokens, idf);
      const contentSim = cosineSimilarity(candidateVec, internVec);
      const contentScore = Math.max(0, Math.min(1, contentSim)) * 70;

      // Sector score (0-20)
      const sectorScore = sectorMatches(
        candidateProfile.sectorInterests,
        internship.sector,
      )
        ? 20
        : semanticSectorBump(candidateProfile.skills, internship.sector)
          ? 8
          : 0;

      // Location score (0-15)
      const locationScore =
        locationMatches(
          candidateProfile.residencyPin,
          candidateProfile.preferredLocations,
          internship.city,
          internship.state,
          internship.pin,
          internship.remote,
        ) * 15;

      // Inclusion bonus (0-5)
      const inclusion = inclusionBonus(
        candidateProfile.ruralFlag,
        internship.sector,
      );

      // Total score
      const totalScore = Math.min(
        100,
        contentScore + sectorScore + locationScore + inclusion,
      );

      // Build match reasons
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
      };
    });

    // Sort by score (desc) then by deadline (asc)
    scoredInternships.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return (
        new Date(a.internship.deadline).getTime() -
        new Date(b.internship.deadline).getTime()
      );
    });

    // Return top 5
    const topRecommendations = scoredInternships.slice(0, 5);

    // Optional: augment with AI-generated concise reasons if key is available
    try {
      if (process.env.GOOGLE_API_KEY) {
        const { generateText } = await import("../lib/gemini");
        const profileSummary = `Skills: ${candidateProfile.skills.join(", ")} | Interests: ${candidateProfile.sectorInterests.join(", ")} | Locations: ${candidateProfile.preferredLocations.join(", ")}`;
        const list = topRecommendations
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
        for (
          let i = 0;
          i < topRecommendations.length && i < lines.length;
          i++
        ) {
          const reason = lines[i];
          if (reason) {
            topRecommendations[i].matchReasons = [
              reason,
              ...topRecommendations[i].matchReasons,
            ].slice(0, 3);
          }
        }
      }
    } catch (e) {
      // ignore AI errors and proceed with deterministic reasons
    }

    const response: RecommendationsResponse = {
      success: true,
      recommendations: topRecommendations,
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
