import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import { CSVUploadResponse, EducationLevel } from "@shared/api";

// Validation schema for CSV row
const CSVRowSchema = z.object({
  title: z.string().min(1),
  sector: z.string().min(1),
  orgName: z.string().min(1),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin: z.string().optional(),
  remote: z.string().transform(val => val.toLowerCase() === 'true' || val === '1'),
  minEducation: z.enum(['TENTH_PLUS_TWO', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE']),
  requiredSkills: z.string().transform(val => 
    val.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
  ),
  stipendMin: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  stipendMax: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  applicationUrl: z.string().url(),
  deadline: z.string().transform(val => new Date(val)),
  active: z.string().optional().transform(val => val ? val.toLowerCase() === 'true' : true)
});

export const handleCSVUpload: RequestHandler = async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({
        success: false,
        uploaded: 0,
        errors: ["Invalid CSV data format"],
        message: "CSV data must be an array of objects"
      });
    }

    const errors: string[] = [];
    let uploaded = 0;

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        const validatedRow = CSVRowSchema.parse(row);
        
        // Create internship
        const internship = await db.internship.create({
          data: {
            title: validatedRow.title,
            sector: validatedRow.sector,
            orgName: validatedRow.orgName,
            description: validatedRow.description,
            city: validatedRow.city,
            state: validatedRow.state,
            pin: validatedRow.pin,
            remote: validatedRow.remote,
            minEducation: validatedRow.minEducation as EducationLevel,
            stipendMin: validatedRow.stipendMin,
            stipendMax: validatedRow.stipendMax,
            applicationUrl: validatedRow.applicationUrl,
            deadline: validatedRow.deadline,
            active: validatedRow.active
          }
        });

        // Handle required skills
        for (const skillName of validatedRow.requiredSkills) {
          // Find or create skill
          let skill = await db.skill.findUnique({
            where: { name: skillName }
          });

          if (!skill) {
            skill = await db.skill.create({
              data: {
                name: skillName,
                slug: skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')
              }
            });
          }

          // Link skill to internship
          await db.internshipSkill.create({
            data: {
              internshipId: internship.id,
              skillId: skill.id
            }
          });
        }

        uploaded++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        if (error instanceof z.ZodError) {
          errors.push(`Row ${i + 1}: ${error.errors.map(e => e.message).join(', ')}`);
        } else {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    const response: CSVUploadResponse = {
      success: uploaded > 0,
      uploaded,
      errors,
      message: uploaded > 0 
        ? `Successfully uploaded ${uploaded} internships${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
        : "No internships were uploaded due to errors"
    };

    res.json(response);
  } catch (error) {
    console.error('CSV upload error:', error);
    
    res.status(500).json({
      success: false,
      uploaded: 0,
      errors: ["Internal server error"],
      message: "Failed to process CSV upload"
    });
  }
};
