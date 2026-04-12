"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function processTutorResponse(transcript: string, topicName: string, history: any[]) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const systemPrompt = `
        You are an elite, high-energy AI Study Coach using the Feynman Technique. 
        Your personality: Enthusiastic, supportive, uses "Hype" language, and acts like a personal trainer for the brain.
        
        The student is explaining: "${topicName}".
        Transcript: "${transcript}"
        History: ${JSON.stringify(history)}
        
        YOUR GOAL:
        1. If they nailed it, be EXTREMELY hype! Congratulate them like they just won a trophy.
        2. If they missed parts, ask a short, punchy question to lead them there. DO NOT give the answer.
        3. ALWAYS keep it to 1-2 punchy sentences (for voice output).
        
        Return JSON in this EXACT format:
        {
            "feedback": "string",
            "isComplete": boolean,
            "gaps": ["string"],
            "xpGained": number (100 if isComplete is true, otherwise 10)
        }
        `;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        
        console.log("AI Response Raw:", responseText);

        const response = JSON.parse(responseText);

        return {
            feedback: response.feedback || "Keep going! You're doing great.",
            isComplete: !!response.isComplete,
            gaps: response.gaps || [],
            xpGained: response.xpGained || 10
        };

    } catch (error: any) {
        console.error("Tutor AI Error Details:", error);
        return { 
            feedback: "I'm having a little trouble thinking right now. Let's try that explanation one more time! You've got this.", 
            isComplete: false, 
            gaps: [],
            xpGained: 0
        };
    }
}

export async function finalizeTutorNotes(transcript: string, topicId: string, userId: string) {
    try {
        const topic = await prisma.topic.findUnique({
            where: { id: topicId },
            include: { subject: true }
        });
        
        if (!topic) throw new Error("Topic not found");

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        Generate a concise, professional study "Cheat Sheet" for the topic: "${topic.name}".
        Base it on this transcript of a successful Feynman explanation session: "${transcript}".
        
        Format it in clear Markdown:
        - Use ## for headers.
        - Use Bullet points for key facts.
        - Include a "Common Pitfalls" section.
        - Include a "One-Sentence Summary".
        `;

        const result = await model.generateContent(prompt);
        const content = result.response.text();

        // Save note to database
        const note = await prisma.note.create({
            data: {
                userId,
                title: `Tutor Notes: ${topic.name}`,
                content: content
            }
        });

        // Update user stats (Simple level up logic)
        await prisma.user.update({
            where: { id: userId },
            data: { 
                exp: { increment: 150 },
                level: { increment: 0 } // Placeholder for actual level logic
            }
        });

        revalidatePath("/notes");
        revalidatePath("/dashboard");
        return { success: true, noteId: note.id };
    } catch (error: any) {
        console.error("Finalize Notes Error:", error);
        return { success: false, error: error.message };
    }
}
