import type { RequestHandler } from "express";
import { db } from "../db";
import { EducationLevel, Language, Role } from "../../shared/api";

export const handleUserRegister: RequestHandler = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(200)
        .json({ success: true, message: "User already exists", userId: existing.id });
    }

    const user = await db.user.create({
      data: {
        email,
        role: Role.CANDIDATE,
      },
    });

    await db.candidateProfile.create({
      data: {
        userId: user.id,
        name: `${firstName} ${lastName}`.trim(),
        educationLevel: EducationLevel.UNDERGRADUATE,
        major: null,
        year: null,
        skills: JSON.stringify([]),
        sectorInterests: JSON.stringify([]),
        preferredLocations: JSON.stringify([]),
        language: Language.EN,
        residencyPin: null,
        ruralFlag: false,
      },
    });

    res.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("User register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
