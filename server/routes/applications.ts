import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";

// Validation schema
const ApplicationSchema = z.object({
  userId: z.string().optional(),
  profileId: z.string().optional(),
  internshipId: z.string(),
  userName: z.string().optional(),
});

export const handleCreateApplication: RequestHandler = async (req, res) => {
  try {
    const validatedData = ApplicationSchema.parse(req.body);

    let userId = validatedData.userId;

    // If profileId is provided, get the userId from the profile
    if (!userId && validatedData.profileId) {
      const profile = await db.candidateProfile.findUnique({
        where: { id: validatedData.profileId },
        include: { user: true }
      });
      
      if (profile) {
        userId = profile.userId;
      }
    }

    // If no userId found, create a guest user
    if (!userId) {
      const email = `guest_${Date.now()}@temp.com`;
      const user = await db.user.create({
        data: {
          email,
          role: "CANDIDATE",
        },
      });
      userId = user.id;
    }

    // Check if application already exists
    const existingApplication = await db.application.findUnique({
      where: {
        userId_internshipId: {
          userId,
          internshipId: validatedData.internshipId,
        }
      }
    });

    if (existingApplication) {
      return res.json({
        success: true,
        message: "Application already exists",
        applicationId: existingApplication.id,
      });
    }

    // Create the application
    const application = await db.application.create({
      data: {
        userId,
        internshipId: validatedData.internshipId,
        status: "APPLIED",
      },
      include: {
        user: true,
        internship: true,
      }
    });

    res.json({
      success: true,
      message: "Application recorded successfully",
      applicationId: application.id,
    });
  } catch (error) {
    console.error("Application creation error:", error);

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

export const handleGetApplications: RequestHandler = async (req, res) => {
  try {
    const applications = await db.application.findMany({
      include: {
        user: {
          include: {
            candidateProfile: true
          }
        },
        internship: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleGetApplicationStats: RequestHandler = async (req, res) => {
  try {
    const totalApplications = await db.application.count();
    const recentApplications = await db.application.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    const uniqueApplicants = await db.application.groupBy({
      by: ['userId'],
    });

    res.json({
      success: true,
      stats: {
        totalApplications,
        recentApplications,
        uniqueApplicants: uniqueApplicants.length,
      }
    });
  } catch (error) {
    console.error("Get application stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
