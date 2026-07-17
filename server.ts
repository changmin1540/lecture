import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Analysis Endpoint
app.post("/api/analyze-test", async (req, res) => {
  try {
    const { testData, comparisonData } = req.body;
    
    const prompt = `
      You are an expert Pyro-Device R&D Engineer.
      Analyze the following test result.
      
      Current Test:
      - Max Pressure: ${testData.maxPressure} psi
      - Activation Time: ${testData.activationTime} ms
      - Revision: ${testData.revision}
      - Condition: ${testData.condition}
      
      ${comparisonData ? `Comparison Data (Previous Rev):
      - Max Pressure: ${comparisonData.maxPressure} psi
      - Activation Time: ${comparisonData.activationTime} ms` : ''}
      
      Task:
      1. Provide a concise professional summary (1-2 sentences).
      2. Detect if this is an outlier based on typical performance or compared to the previous rev.
      3. Calculate delta changes if comparison data is provided.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            isOutlier: { type: Type.BOOLEAN },
            deltaPressure: { type: Type.NUMBER },
            deltaActivation: { type: Type.NUMBER },
          },
          required: ["summary", "isOutlier"]
        }
      }
    });

    const text = response.text;
    res.json(JSON.parse(text || "{}"));
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze test data" });
  }
});

// Vite Middleware
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initServer();
