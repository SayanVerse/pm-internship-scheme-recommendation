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
    .transform((val) => val === undefined ? undefined : val === "true"),
  sector: z.string().optional(),
  search: z.string().optional(),
});

export const handleInternshipsList: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Internships API called with query:", req.query);

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

    console.log("📊 Query where clause:", where);

    // Get total count
    const total = await db.internship.count({ where });
    console.log("📈 Total internships count:", total);

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

    console.log("🎯 Found internships:", internships.length);

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
