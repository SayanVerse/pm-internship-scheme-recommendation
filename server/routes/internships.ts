import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import { InternshipsListResponse } from "@shared/api";

// Validation schema for listing
const InternshipsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val), 100) : 20)),
  active: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  sector: z.string().optional(),
  search: z.string().optional(),
});

export const handleInternshipsList: RequestHandler = async (req, res) => {
  try {
    const { page, limit, active, sector, search } =
      InternshipsQuerySchema.parse(req.query);

    const where: any = {};

    // Filter by active status
    if (active !== undefined) {
      where.active = active;
    }

    // Filter by sector
    if (sector) {
      where.sector = sector;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { orgName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await db.internship.count({ where });

    // Get paginated results
    const internships = await db.internship.findMany({
      where,
      include: {
        requiredSkills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data
    const transformedInternships = internships.map((internship) => ({
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
      minEducation: internship.minEducation,
      applicationUrl: internship.applicationUrl,
      deadline: internship.deadline.toISOString(),
      active: internship.active,
      requiredSkills: internship.requiredSkills.map((rs) => rs.skill.name),
    }));

    const response: InternshipsListResponse = {
      success: true,
      internships: transformedInternships,
      total,
      page,
      limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Internships list error:", error);

    res.status(500).json({
      success: false,
      internships: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  }
};

// Get single internship by ID
export const handleInternshipById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const internship = await db.internship.findUnique({
      where: { id },
      include: {
        requiredSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const transformedInternship = {
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
      minEducation: internship.minEducation,
      applicationUrl: internship.applicationUrl,
      deadline: internship.deadline.toISOString(),
      active: internship.active,
      requiredSkills: internship.requiredSkills.map((rs) => rs.skill.name),
    };

    res.json({
      success: true,
      internship: transformedInternship,
    });
  } catch (error) {
    console.error("Internship by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new internship
export const handleInternshipCreate: RequestHandler = async (req, res) => {
  try {
    const {
      title,
      sector,
      orgName,
      description,
      city,
      state,
      pin,
      remote,
      minEducation,
      stipendMin,
      stipendMax,
      applicationUrl,
      deadline,
      active,
      requiredSkills,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !sector ||
      !orgName ||
      !minEducation ||
      !applicationUrl ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create internship
    const internship = await db.internship.create({
      data: {
        title,
        sector,
        orgName,
        description,
        city,
        state,
        pin,
        remote: Boolean(remote),
        minEducation,
        stipendMin: stipendMin ? parseInt(stipendMin) : null,
        stipendMax: stipendMax ? parseInt(stipendMax) : null,
        applicationUrl,
        deadline: new Date(deadline),
        active: Boolean(active),
      },
    });

    // Handle required skills
    if (requiredSkills && Array.isArray(requiredSkills)) {
      for (const skillName of requiredSkills) {
        if (!skillName.trim()) continue;

        // Find or create skill
        let skill = await db.skill.findUnique({
          where: { name: skillName.trim() },
        });

        if (!skill) {
          skill = await db.skill.create({
            data: {
              name: skillName.trim(),
              slug: skillName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-"),
            },
          });
        }

        // Link skill to internship
        await db.internshipSkill.create({
          data: {
            internshipId: internship.id,
            skillId: skill.id,
          },
        });
      }
    }

    res.json({
      success: true,
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
        minEducation: internship.minEducation as any,
        applicationUrl: internship.applicationUrl,
        deadline: internship.deadline.toISOString(),
        active: internship.active,
        requiredSkills: requiredSkills || [],
      },
      message: "Internship created successfully",
    });
  } catch (error) {
    console.error("Internship create error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
