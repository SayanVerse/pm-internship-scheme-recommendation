import {
  LocalInternship,
  getLocalInternships,
} from "./localStorage-internships";

export interface LocalRecommendationMatch {
  internship: {
    id: string;
    title: string;
    sector: string;
    orgName: string;
    description?: string;
    stipendMin?: number;
    stipendMax?: number;
    city?: string;
    state?: string;
    remote: boolean;
    applicationUrl: string;
    deadline: string;
    requiredSkills: string[];
  };
  score: number;
  matchReasons: string[];
}

interface CandidateProfile {
  name: string;
  educationLevel: string;
  skills: string[];
  sectorInterests: string[];
  preferredLocations: string[];
  residencyPin?: string;
  ruralFlag: boolean;
}

// Education level hierarchy for comparison
const EDUCATION_HIERARCHY: Record<string, number> = {
  TENTH_PLUS_TWO: 1,
  "B.Tech (CSE/IT)": 3,
  "B.Tech/B.Sc (CS/Stats/Math)": 3,
  "MBA/BBA": 4,
  "B.Tech (ECE/EEE)": 3,
  "B.Tech/M.Tech (CSE/AI)": 4,
  "B.Des/M.Des": 3,
  "MBA/CA": 4,
  "BA/MA (English, Journalism)": 3,
  "MBA (HR)": 4,
  "B.Tech (Civil)": 3,
  "B.Tech (Mechanical)": 3,
  "B.Tech/B.Sc (Game Dev/CS)": 3,
  DIPLOMA: 2,
  UNDERGRADUATE: 3,
  POSTGRADUATE: 4,
};

function jaccardSimilarity(set1: string[], set2: string[]): number {
  const normalizedSet1 = set1.map((s) => s.toLowerCase());
  const normalizedSet2 = set2.map((s) => s.toLowerCase());

  const intersection = normalizedSet1.filter((x) =>
    normalizedSet2.includes(x),
  ).length;
  const union = new Set([...normalizedSet1, ...normalizedSet2]).size;
  return union === 0 ? 0 : intersection / union;
}

function locationMatches(
  candidatePin: string | undefined,
  candidateLocations: string[],
  internshipCity: string | undefined,
  internshipState: string | undefined,
  internshipPin: string | undefined,
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
    analytics: [
      "python",
      "data",
      "analysis",
      "machine learning",
      "pandas",
      "statistics",
    ],
    design: ["figma", "photoshop", "illustrator", "ui", "ux", "design"],
    finance: [
      "excel",
      "finance",
      "accounting",
      "data analysis",
      "math",
      "financial modeling",
    ],
    marketing: ["digital marketing", "seo", "social media", "content writing"],
    cybersecurity: ["networking", "ethical hacking", "security"],
    mechanical: ["autocad", "solidworks", "mechanical"],
    civil: ["autocad", "structural engineering", "civil"],
    gaming: ["unity", "c#", "game design"],
    cloud: ["aws", "cloud computing", "linux"],
  };

  const normalizedSector = sector.toLowerCase();
  const keywords = sectorKeywords[normalizedSector] || [];

  return skills.some((skill) =>
    keywords.some((keyword) => skill.toLowerCase().includes(keyword)),
  );
}

function inclusionBonus(ruralFlag: boolean, sector: string): number {
  if (!ruralFlag) return 0;

  const ruralFriendlySectors = [
    "agriculture",
    "education",
    "public admin",
    "civil engineering",
  ];
  return ruralFriendlySectors.includes(sector.toLowerCase()) ? 5 : 0;
}

function buildMatchReasons(
  candidateSkills: string[],
  candidateInterests: string[],
  candidateLocations: string[],
  candidatePin: string | undefined,
  internship: LocalInternship,
  skillScore: number,
  sectorScore: number,
  locationScore: number,
): string[] {
  const reasons: string[] = [];

  // Skills match
  const matchingSkills = candidateSkills.filter((skill) =>
    internship.requiredSkills.some(
      (req) => req.toLowerCase() === skill.toLowerCase(),
    ),
  );

  if (matchingSkills.length > 0) {
    reasons.push(
      `You have ${matchingSkills.length} of ${internship.requiredSkills.length} required skills: ${matchingSkills.slice(0, 3).join(", ")}`,
    );
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

  // Add some generic reasons if we don't have enough
  if (reasons.length === 0) {
    reasons.push("Good opportunity for skill development");
  }

  return reasons.slice(0, 3); // Max 3 reasons
}

export function getLocalRecommendations(
  profile: CandidateProfile,
): LocalRecommendationMatch[] {
  try {
    const internships = getLocalInternships();

    if (!internships || internships.length === 0) {
      console.warn("No local internships found");
      return [];
    }

    // Filter by education level (simplified)
    const candidateLevel = EDUCATION_HIERARCHY[profile.educationLevel] || 3;
    const eligibleInternships = internships.filter((internship) => {
      const requiredLevel = EDUCATION_HIERARCHY[internship.minEducation] || 3;
      return candidateLevel >= requiredLevel && internship.active;
    });

    // Score each internship
    const scoredInternships = eligibleInternships.map((internship) => {
      // Skills score (0-60)
      const skillScore =
        jaccardSimilarity(profile.skills, internship.requiredSkills) * 60;

      // Sector score (0-20)
      const sectorScore = sectorMatches(
        profile.sectorInterests,
        internship.sector,
      )
        ? 20
        : semanticSectorBump(profile.skills, internship.sector)
          ? 8
          : 0;

      // Location score (0-15)
      const locationScore =
        locationMatches(
          profile.residencyPin,
          profile.preferredLocations,
          internship.city,
          internship.state,
          internship.pin,
          internship.remote,
        ) * 15;

      // Inclusion bonus (0-5)
      const inclusion = inclusionBonus(profile.ruralFlag, internship.sector);

      // Total score
      const totalScore = Math.min(
        100,
        skillScore + sectorScore + locationScore + inclusion,
      );

      // Build match reasons
      const matchReasons = buildMatchReasons(
        profile.skills,
        profile.sectorInterests,
        profile.preferredLocations,
        profile.residencyPin,
        internship,
        skillScore,
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
          remote: internship.remote,
          applicationUrl: internship.applicationUrl,
          deadline: internship.deadline,
          requiredSkills: internship.requiredSkills,
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
    return scoredInternships.slice(0, 5);
  } catch (error) {
    console.error("Error getting local recommendations:", error);
    return [];
  }
}
