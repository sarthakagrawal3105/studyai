"use server";

import { prisma } from "@/lib/prisma";
import { runWithRotation } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function analyzeStudyImage(base64Image: string, userId: string) {
    try {
        // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
        const imageData = base64Image.split(",")[1];
        
        const prompt = `
        You are an elite AI Study Assistant. I am providing an image of a study material (textbook, notes, or slides).
        
        YOUR TASK:
        1. Extract the main subject and title.
        2. Provide a 3-paragraph executive summary.
        3. Identify 5-7 key topics/concepts mentioned.
        4. Generate 3 "Deep Thinking" questions for the student.
        
        Return the result as a structured JSON object:
        {
            "title": "string",
            "summary": "string (Markdown allowed)",
            "keyTopics": ["string"],
            "studyQuestions": ["string"]
        }
        `;

        const result = await runWithRotation(async (model) => {
            return await model.generateContent([
                {
                    inlineData: {
                        data: imageData,
                        mimeType: "image/jpeg"
                    }
                },
                prompt
            ]);
        });

        const responseText = result.response.text();
        // Extract JSON from potential markdown wrapping
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

        // Auto-save as a Note
        const note = await prisma.note.create({
            data: {
                userId,
                title: `Lens: ${data.title || "New Scan"}`,
                content: `## Summary\n${data.summary}\n\n## Key Topics\n${data.keyTopics.join("\n")}\n\n## Study Questions\n${data.studyQuestions.join("\n")}`
            }
        });

        revalidatePath("/notes");
        return { success: true, data, noteId: note.id };

    } catch (error: any) {
        console.error("Lens AI Error:", error);
        return { success: false, error: "Failed to analyze image. Please ensure the image is clear and under 4MB." };
    }
}
