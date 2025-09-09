import type { RequestHandler } from "express";
import { db } from "../db";
import { EducationLevel, Language, Role } from "../../shared/api";

export const handleUsersList: RequestHandler = async (_req, res) => {
  try {
    const users = await db.user.findMany({
      include: {
        candidateProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.candidateProfile?.name ?? null,
      createdAt: u.createdAt.toISOString(),
    }));

    res.json({ success: true, users: transformed });
  } catch (error) {
    console.error("Users list error:", error);
    res
      .status(500)
      .json({ success: false, users: [], message: "Internal server error" });
  }
};

export const handleUserDelete: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete admin user" });
    }

    await db.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("User delete error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
