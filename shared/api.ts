/**
 * Shared code between client and server
 * PM Internship Recommender API types
 */

// Enums matching Prisma schema
export enum Role {
  CANDIDATE = "CANDIDATE",
  ADMIN = "ADMIN",
}

export enum EducationLevel {
  TENTH_PLUS_TWO = "TENTH_PLUS_TWO",
  DIPLOMA = "DIPLOMA",
  UNDERGRADUATE = "UNDERGRADUATE",
  POSTGRADUATE = "POSTGRADUATE",
}

export enum Language {
  EN = "EN",
  HI = "HI",
  BN = "BN",
}

export enum ApplicationStatus {
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

// API Request/Response types
export interface CandidateProfileData {
  name: string;
  educationLevel: EducationLevel;
  major?: string;
  year?: number;
  skills: string[];
  sectorInterests: string[];
  preferredLocations: string[];
  language: Language;
  residencyPin?: string;
  ruralFlag: boolean;
}

export interface InternshipData {
  id: string;
  title: string;
  sector: string;
  orgName: string;
  description?: string;
  stipendMin?: number;
  stipendMax?: number;
  city?: string;
  state?: string;
  pin?: string;
  remote: boolean;
  minEducation: EducationLevel;
  applicationUrl: string;
  deadline: string; // ISO date string
  active: boolean;
  requiredSkills: string[]; // skill names
}

export interface RecommendationMatch {
  internship: InternshipData;
  score: number;
  matchReasons: string[];
}

export interface IntakeResponse {
  success: boolean;
  profileId?: string;
  message?: string;
}

export interface RecommendationsRequest {
  profileId?: string;
  profile?: CandidateProfileData;
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: RecommendationMatch[];
  message?: string;
}

export interface InternshipsListResponse {
  success: boolean;
  internships: InternshipData[];
  total: number;
  page: number;
  limit: number;
}

export interface CSVUploadResponse {
  success: boolean;
  uploaded: number;
  errors: string[];
  message: string;
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}
