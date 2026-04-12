"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getNotes(userId: string) {
    return await prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function generateSmartNote(topic: string, mode: "GENERATE" | "REFINE", userId: string, rawContent?: string) {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        const systemPrompt = mode === "GENERATE" 
            ? `Search and generate a professional, high-level study Note for the topic: "${topic}".`
            : `Refine and structure the following raw student notes into a professional study Note: "${rawContent}".`;

        const prompt = `
        ${systemPrompt}
        
        YOUR NOTE FORMAT (Markdown):
        # [Clear Title]
        
        ## 📝 Executive Summary
        [2-3 sentence overview of the "Big Picture"]
        
        ## 🧠 Core Concepts
        [Structured deep-dive with bullet points and bolded terms]
        
        ## 💡 Memory Tricks (Mnemonics)
        [Provide 1-2 tricks or analogies to remember this easily]
        
        ## ⚠️ Common Pitfalls
        [Things students usually get wrong about this]
        
        ---
        ## 🧪 Active Recall Check
        1. [Self-test Question 1]
        2. [Self-test Question 2]
        3. [Self-test Question 3]
        
        Return the response as a JSON object:
        {
            "title": "Clean Note Title",
            "content": "Full Markdown content starting from headers"
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        const note = await prisma.note.create({
            data: {
                userId,
                title: data.title,
                content: data.content
            }
        });

        revalidatePath("/notes");
        return { success: true, note };
    } catch (error: any) {
        console.error("Smart Note Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteNote(id: string, userId: string) {
    try {
        await prisma.note.delete({
            where: { id, userId }
        });
        revalidatePath("/notes");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
