import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import { IntakeResponse, EducationLevel, Language } from "@shared/api";

// Validation schema
const IntakeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  educationLevel: z.enum([
    "TENTH_PLUS_TWO",
    "DIPLOMA",
    "UNDERGRADUATE",
    "POSTGRADUATE",
  ]),
  major: z.string().optional(),
  year: z.number().optional(),
  skills: z.array(z.string()),
  sectorInterests: z.array(z.string()),
  preferredLocations: z.array(z.string()),
  language: z.enum(["EN", "HI", "BN"]).default("EN"),
  residencyPin: z.string().optional(),
  ruralFlag: z.boolean().default(false),
});

export const handleIntake: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const validatedData = IntakeSchema.parse(req.body);

    // For now, create a guest user if no auth
    // In production, this would use actual auth
    const email = `guest_${Date.now()}@temp.com`;

    // Create or get user
    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          role: "CANDIDATE",
        },
      });
    }

    // Create or update candidate profile
    const existingProfile = await db.candidateProfile.findUnique({
      where: { userId: user.id },
    });

    const profileData = {
      userId: user.id,
      name: validatedData.name,
      educationLevel: validatedData.educationLevel as EducationLevel,
      major: validatedData.major,
      year: validatedData.year,
      skills: JSON.stringify(validatedData.skills),
      sectorInterests: JSON.stringify(validatedData.sectorInterests),
      preferredLocations: JSON.stringify(validatedData.preferredLocations),
      language: validatedData.language as Language,
      residencyPin: validatedData.residencyPin,
      ruralFlag: validatedData.ruralFlag,
    };

    let profile;
    if (existingProfile) {
      profile = await db.candidateProfile.update({
        where: { id: existingProfile.id },
        data: profileData,
      });
    } else {
      profile = await db.candidateProfile.create({
        data: profileData,
      });
    }

    const response: IntakeResponse = {
      success: true,
      profileId: profile.id,
      message: "Profile saved successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Intake error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
