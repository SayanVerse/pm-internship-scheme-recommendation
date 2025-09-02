import { RequestHandler } from "express";
import { generateText } from "../lib/gemini";

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { prompt, system, model } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "prompt is required" });
    }
    const sys = system ? `System: ${system}\n` : "";
    const text = await generateText(`${sys}${prompt}`, model);
    res.json({ success: true, text });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ success: false, message: "AI service error" });
  }
};
