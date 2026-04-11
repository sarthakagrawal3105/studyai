"use server"

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSyllabusPlan(formData: FormData) {
  try {
    const file = formData.get("syllabusPdf") as File;
    const targetWeeks = formData.get("targetWeeks") as string || "";
    const targetHours = formData.get("targetHours") as string || "";
    
    if (!file) {
      throw new Error("No PDF file provided");
    }

    // Convert PDF File to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    let constraintPrompt = "";
    if (targetWeeks) {
      constraintPrompt += `\nCRITICAL ENFORCEMENT 1 (Target Weeks): You MUST structure the plan into exactly the number of weeks specified here: "${targetWeeks}". If this is a range (e.g. "6-8", "6 to 8"), pick a precise number within that range that best fits the material and strictly stick to it.`;
    }
    if (targetHours) {
      constraintPrompt += `\nCRITICAL ENFORCEMENT 2 (Target Hours): You MUST ensure that the sum of all "estimatedHours" across all topics roughly equals this total hour constraint: "${targetHours}". If this is a range (e.g. "50-60"), distribute the hours so the final sum lands cleanly inside that boundary.`;
    }

    const prompt = `
You are an expert, world-class study planner and AI tutor. Analyze this academic syllabus and architect a complete, week-by-week master study plan.
${constraintPrompt}

The student needs an ACTIVE learning plan, not just a passive checklist. Extract the core topics and distribute them intelligently. If no strict week constraint was given, estimate a reasonable timeframe (e.g., 4 to 12 weeks).

Return ONLY a valid, raw JSON object matching EXACTLY this structure (no markdown blocks like \`\`\`json):
{
  "totalWeeks": <int>, // MUST match your actual generated week count
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "A short overarching theme for the week",
      "topics": [
        {
          "title": "Clear Topic Name",
          "description": "1-2 sentence overview of the topic.",
          "estimatedHours": <int>,
          "activeLearningStrategy": "Highly specific advice on HOW to study this. Mention what concepts are critical, what common traps to avoid, and propose active exercises (e.g. 'Draw a memory map of X', 'Solve 5 practice problems on Y', 'Explain Z using the Feynman technique')."
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        }
      ]
    });

    const text = response.text;
    
    // Clean up potential markdown blocks if the model still outputs them
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const plan = JSON.parse(cleanedText);
    
    return { success: true, plan };
  } catch (err: any) {
    console.error("Error generating plan:", err);
    return { success: false, error: err.message || "Failed to parse syllabus. Please make sure it's a valid text-based PDF." };
  }
}
