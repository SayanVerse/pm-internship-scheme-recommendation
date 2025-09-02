import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleIntake } from "./routes/intake";
import { handleRecommend } from "./routes/recommend";
import {
  handleInternshipsList,
  handleInternshipById,
  handleInternshipCreate,
  handleInternshipUpdate,
  handleInternshipDelete,
} from "./routes/internships";
import { handleUsersList, handleUserDelete } from "./routes/users";
import { handleCSVUpload } from "./routes/upload";
import {
  handleCreateApplication,
  handleGetApplications,
  handleGetApplicationStats,
} from "./routes/applications";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // PM Internship Recommender API routes
  app.post("/api/intake", handleIntake);
  app.post("/api/recommend", handleRecommend);
  app.get("/api/internships", handleInternshipsList);
  app.post("/api/internships", handleInternshipCreate);
  app.get("/api/internships/:id", handleInternshipById);
  app.post("/api/internships/upload", handleCSVUpload);

  // Applications API routes
  app.post("/api/applications", handleCreateApplication);
  app.get("/api/applications", handleGetApplications);
  app.get("/api/applications/stats", handleGetApplicationStats);

  return app;
}
