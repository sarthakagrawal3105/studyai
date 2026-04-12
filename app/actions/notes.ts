"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getNotes(userId: string) {
    return await prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}

export type NoteMode = "TEACHER" | "REVISION" | "EXAM" | "CLEANER" | "COMPARE";

export async function generateSmartNote(topic: string, mode: NoteMode, userId: string, rawContent?: string, attachment?: { data: string, mimeType: string }) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const inputData = rawContent || topic;
        let systemPrompt = "";

        switch (mode) {
            case "TEACHER":
                systemPrompt = `
                You are an expert teacher. Convert the input into the "Ultra-Smart" note format.
                STRICT INSTRUCTIONS:
                - Use VERY SIMPLE language.
                - Avoid long paragraphs; use bullet points wherever possible.
                - Highlight important terms with **bold**.
                - Make it EASY to revise in less than 2 minutes.
                
                OUTPUT FORMAT (STRICTLY FOLLOW):
                1. 📌 Title
                2. 📖 Definition (2-3 lines only)
                3. 🔑 Key Points (1 line per bullet)
                4. 🧠 Explanation (Use sub-headings, no long paragraphs)
                5. 📊 Diagram / Flow (Text-based steps/process)
                6. 🧪 Examples
                7. 🏷️ Keywords (Max 15 terms)
                8. 📝 5-Mark Answer (5-6 points)
                9. 🧾 10-Mark Answer (Intro + Points + Conclusion)
                10. ⚡ Quick Revision (6-8 ultra-short bullets)
                `;
                break;
            case "REVISION":
                systemPrompt = `
                Convert the input into ultra-short revision notes.
                RULES: 8-10 bullet points max, only key facts, no explanations, 1-minute read time.
                `;
                break;
            case "EXAM":
                systemPrompt = `
                Generate an exam-ready 10-mark answer.
                REQUIRED STRUCTURE: Introduction, Main content with headings, Conclusion. Simple language.
                `;
                break;
            case "CLEANER":
                systemPrompt = `
                You are an AI that cleans and organizes messy OCR/PDF notes.
                TASKS: Correct spelling/spelling, fix sentence structure, organize with headings, highlight important terms.
                `;
                break;
            case "COMPARE":
                systemPrompt = `
                Convert the input into a professional comparison table using Markdown formatting.
                Include features, differences, and examples.
                `;
                break;
        }

        const prompt = `
        ${systemPrompt}
        
        INPUT DATA: "${inputData}"
        
        INSTRUCTIONS:
        - Use simple and clear language.
        - Focus only on important concepts.
        - Structure with professional Markdown.
        
        Return the result as a JSON object:
        {
            "title": "Clean & Descriptive Title",
            "content": "Full formatted Markdown content"
        }
        `;

        const promptContent = attachment ? [
            {
                inlineData: {
                    data: attachment.data,
                    mimeType: attachment.mimeType
                }
            },
            prompt
        ] : prompt;

        const result = await model.generateContent(promptContent);
        const text = result.response.text();
        
        // Robust JSON extraction
        let data;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;
            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error("AI JSON Parse Error. Raw Text:", text);
            throw new Error("AI returned an invalid format. Please try again.");
        }

        if (!data.title || !data.content) {
            throw new Error("AI response missing title or content.");
        }

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
        console.error("Full Smart Note Error:", error);
        return { success: false, error: error.message || "Unknown error occurred" };
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
