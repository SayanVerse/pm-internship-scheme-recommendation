export async function generateText(
  prompt: string,
  modelPref?: string,
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }
  const model = modelPref || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = (m: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  } as const;

  async function call(modelName: string): Promise<string> {
    const res = await fetch(endpoint(modelName), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output_text;
    if (!text) throw new Error("No text in Gemini response");
    return text as string;
  }

  try {
    return await call(model);
  } catch (e) {
    const fallbacks = ["gemini-1.5-flash", "gemini-1.5-pro"];
    for (const fb of fallbacks) {
      try {
        return await call(fb);
      } catch {}
    }
    throw e;
  }
}

// Generate structured JSON using Gemini with an explicit JSON response MIME type
export async function generateJSON<T = unknown>(
  prompt: string,
  modelPref?: string,
): Promise<T> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }
  const model = modelPref || process.env.GEMINI_MODEL || "gemini-1.5-pro";
  const endpoint = (m: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
    },
  } as const;

  async function call(modelName: string): Promise<T> {
    const res = await fetch(endpoint(modelName), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output_text;
    if (!text) throw new Error("No content in Gemini response");
    try {
      return JSON.parse(text) as T;
    } catch (err) {
      throw new Error("Failed to parse JSON from Gemini response");
    }
  }

  try {
    return await call(model);
  } catch (e) {
    const fallbacks = ["gemini-1.5-pro", "gemini-1.5-flash"]; // try both directions
    for (const fb of fallbacks) {
      try {
        return await call(fb);
      } catch {}
    }
    // As last resort, try text then parse
    const text = await generateText(prompt, model);
    return JSON.parse(text) as T;
  }
}
