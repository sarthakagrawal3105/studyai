"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDashboardData(userId: string) {
    try {
        // 1. Fetch user profile and study stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subjects: {
                    include: {
                        topics: true,
                        tests: true
                    }
                },
                notes: {
                    take: 3,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) throw new Error("User not found");

        // 2. Core Stats Calculations
        const totalTopics = user.subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
        const completedTopics = user.subjects.reduce((acc, sub) => acc + sub.topics.filter(t => t.isCompleted).length, 0);
        const masteryPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        // 3. Adaptive AI Logic: Find Priority Topics
        // Priority topics are those with low test scores OR uncompleted in the syllabus
        const priorityCards: any[] = [];
        
        user.subjects.forEach(subject => {
            // Find topics with failing tests (< 50%)
            subject.tests.filter(test => test.score !== null && test.score < 50).forEach(failedTest => {
                priorityCards.push({
                    type: "CORRECT",
                    id: failedTest.id,
                    title: `Fix: ${subject.name}`,
                    description: `You struggled with the last test. Let's master the concepts now.`,
                    subjectColor: "text-red-500",
                    bg: "bg-red-500/10"
                });
            });

            // Find next uncompleted topic
            const nextTopic = subject.topics.find(t => !t.isCompleted);
            if (nextTopic && priorityCards.length < 5) {
                priorityCards.push({
                    type: "LEARN",
                    id: nextTopic.id,
                    title: `Next Up: ${nextTopic.name}`,
                    description: `Part of ${subject.name}. Your path to mastery continues here.`,
                    subjectColor: "text-indigo-500",
                    bg: "bg-indigo-500/10"
                });
            }
        });

        // 4. AI Daily Briefing
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const briefingPrompt = `
        You are a supportive, high-energy AI Study Coach. 
        Student Name: ${user.name || "Innovator"}
        Mastery: ${masteryPercentage}%
        Completed Tasks: ${completedTopics}
        Last 3 Notes: ${user.notes.map(n => n.title).join(", ")}

        Write a 2-sentence encouraging morning greeting. Focus on personal growth and "Better Everyday" philosophy.
        `;

        const briefingResult = await model.generateContent(briefingPrompt);
        const briefing = briefingResult.response.text();

        return {
            user,
            masteryPercentage,
            priorityCards: priorityCards.slice(0, 4),
            aiBriefing: briefing,
            recentNotes: user.notes
        };

    } catch (error) {
        console.error("Dashboard Action Error:", error);
        throw error;
    }
}
