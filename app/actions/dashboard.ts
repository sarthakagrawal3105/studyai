"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Simple in-memory cache to prevent 429 Quota errors during development
const briefingCache: Record<string, { text: string; expiry: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getDashboardData(userId: string) {
    try {
        // 1. Fetch user profile with all relevant relations
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subjects: {
                    include: {
                        topics: {
                            include: {
                                tests: {
                                    orderBy: { createdAt: 'desc' },
                                    take: 1
                                }
                            }
                        }
                    }
                },
                tests: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        topic: true
                    }
                },
                notes: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) throw new Error("User not found");

        // 2. Calculations
        const totalTopics = user.subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
        const completedTopics = user.subjects.reduce((acc, sub) => acc + sub.topics.filter(t => t.isCompleted).length, 0);
        const masteryPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        const validTests = user.tests.filter(t => t.score !== null);
        const averageScore = validTests.length > 0 
            ? Math.round(validTests.reduce((acc, t) => acc + (t.score || 0), 0) / validTests.length) 
            : 0;

        // 3. Subject Mastery Grid Data
        const subjectStats = user.subjects.map(subject => {
            const subjectTopics = subject.topics.length;
            const subjectCompleted = subject.topics.filter(t => t.isCompleted).length;
            const subjectProgress = subjectTopics > 0 ? Math.round((subjectCompleted / subjectTopics) * 100) : 0;
            
            // Get latest score for this subject
            const subjectTests = subject.topics.flatMap(t => t.tests).filter(test => test.score !== null);
            const latestScore = subjectTests.length > 0 ? subjectTests[0].score : null;

            return {
                id: subject.id,
                name: subject.name,
                progress: subjectProgress,
                latestScore,
                totalTopics: subjectTopics,
                completedTopics: subjectCompleted,
                trending: latestScore !== null ? (latestScore >= 70 ? "UP" : "DOWN") : "NEUTRAL"
            };
        });

        // 4. Assessment Queue (Tests where score is null)
        const pendingAssessments = user.tests.filter(t => t.score === null).map(t => ({
            id: t.id,
            title: t.title,
            topicName: t.topic?.name || "General",
            createdAt: t.createdAt
        }));

        // 5. Find Next Priority Topic
        let nextTopic = null;
        for (const subject of user.subjects) {
            const found = subject.topics.find(t => !t.isCompleted);
            if (found) {
                nextTopic = {
                    id: found.id,
                    name: found.name,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    strategy: found.activeLearningStrategy
                };
                break;
            }
        }

        // 6. AI Daily Briefing (Highly context-aware with Caching)
        let briefing = "Your path to mastery continues today. Let's make every minute count.";
        
        const now = Date.now();
        if (briefingCache[userId] && briefingCache[userId].expiry > now) {
            briefing = briefingCache[userId].text;
        } else {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const briefingPrompt = `
                You are a supportive, high-energy AI Study Coach. 
                Student: ${user.name || "Explorer"}
                Mastery: ${masteryPercentage}%
                Average Test Score: ${averageScore}%
                Next Topic: ${nextTopic?.name || "Not set"}
                
                Write a 2-sentence encouraging briefing. Focus on growth mindset.
                `;

                const briefingResult = await model.generateContent(briefingPrompt);
                briefing = briefingResult.response.text();
                
                // Store in cache
                briefingCache[userId] = {
                    text: briefing,
                    expiry: now + CACHE_DURATION
                };
            } catch (aiError: any) {
                console.error("AI Briefing Error:", aiError);
                // Fallback if cached version exists but expired
                if (briefingCache[userId]) {
                    briefing = briefingCache[userId].text;
                }
                
                if (aiError.message?.includes("429")) {
                    briefing = "AI Briefing is resting (Rate Limit). " + briefing;
                }
            }
        }

        return {
            user: {
                name: user.name,
                level: user.level,
                exp: user.exp,
                id: user.id
            },
            stats: {
                mastery: masteryPercentage,
                totalTopics,
                completedTopics,
                averageScore,
                streak: 3 // Placeholder
            },
            subjectStats,
            pendingAssessments,
            nextTopic,
            aiBriefing: briefing,
            recentNotes: user.notes,
            testHistory: user.tests.filter(t => t.score !== null).map(t => ({ 
                score: t.score, 
                label: new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) 
            })).slice(0, 7)
        };

    } catch (error) {
        console.error("Dashboard Action Error:", error);
        throw error;
    }
}
