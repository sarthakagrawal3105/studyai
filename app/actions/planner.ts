"use server";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { runWithRotation } from "@/lib/gemini";

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

    const result = await runWithRotation(async (model) => {
      return await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        }
      ]);
    });

    const response = await result.response;
    const text = response.text() || "";
    
    // Clean up potential markdown blocks if the model still outputs them
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const plan = JSON.parse(cleanedText);
    
    return { success: true, plan };
  } catch (err: any) {
    console.error("Error generating plan:", err);
    
    // Check for standard Gemini quota exceeded error
    if (err.message?.includes("429") || err.message?.toLowerCase().includes("quota")) {
      return { 
        success: false, 
        error: "AI Quota Exceeded. The free tier of Gemini has a limit on requests per minute. Please wait 30-60 seconds and try again." 
      };
    }
    
    return { success: false, error: err.message || "Failed to parse syllabus. Please make sure it's a valid text-based PDF." };
  }
}

export async function saveSyllabusPlan(plan: any, userId: string, subjectName: string) {
  try {
    // Upsert a dummy user to satisfy relation testing if they don't exist
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@example.com`, name: "Student" }
    });

    const newSubject = await prisma.subject.create({
      data: {
        userId,
        name: subjectName,
        totalWeeks: plan.totalWeeks,
        targetHours: plan.weeks.reduce((acc: number, w: any) => acc + w.topics.reduce((t_acc: number, t: any) => t_acc + t.estimatedHours, 0), 0),
        topics: {
          create: plan.weeks.flatMap((week: any) => 
            week.topics.map((topic: any) => ({
              name: topic.title,
              description: topic.description,
              weekNumber: week.weekNumber,
              estimatedHours: topic.estimatedHours,
              activeLearningStrategy: topic.activeLearningStrategy
            }))
          )
        }
      }
    });
    return { success: true, subjectId: newSubject.id };
  } catch (error: any) {
    console.error("Save plan error:", error);
    return { success: false, error: error.message };
  }
}

export async function completeTopicAndGenerateTest(topicId: string, userId: string) {
  try {
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new Error("Topic not found");

    if (!topic.isCompleted) {
      await prisma.topic.update({
        where: { id: topicId },
        data: { isCompleted: true }
      });
    }

    let previousIncorrectContext = "";
    if (topic.originalTopicId) {
      const previousTests = await prisma.test.findMany({
        where: { topicId: topic.originalTopicId, userId },
        orderBy: { createdAt: 'desc' },
        include: { questions: true }
      });
      const lastFailedTest = previousTests.find(t => (t.score ?? 0) < 70);
      if (lastFailedTest) {
        const incorrectQueries = lastFailedTest.questions
          .filter(q => q.isCorrect === false)
          .map(q => `Question: ${q.questionText} | Options: ${q.options} | Correct Answer: ${q.correctAnswer}`);
        if (incorrectQueries.length > 0) {
          previousIncorrectContext = `
The student previously failed these specific questions on this topic. You MUST include these EXACT questions mixed randomly among new ones:
${incorrectQueries.join("\n")}
`;
        }
      }
    }

    const prompt = `
You are an expert tutor. The student has just completed studying: "${topic.name}".
Their study strategy and context was: "${topic.activeLearningStrategy || topic.description || ''}"
${previousIncorrectContext}

Generate a 10-question multiple-choice test to test their fundamental understanding of this specific topic.
Return ONLY a valid, raw JSON object matching exactly this structure (no markdown blocks like \`\`\`json):
{
  "testTitle": "A concise title for this test",
  "questions": [
    {
      "questionText": "The question here?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct."
    }
  ]
}
`;

    const result = await runWithRotation(async (model) => {
      return await model.generateContent(prompt);
    });
    const response = await result.response;
    const text = response.text() || "";
    let testData;
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        testData = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      } else {
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        testData = JSON.parse(cleanedText);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", text);
      throw new Error("AI returned invalid test format. Please try again.");
    }

    const test = await prisma.test.create({
      data: {
        userId,
        topicId: topic.id,
        title: testData.testTitle,
        questions: {
          create: testData.questions.map((q: any) => ({
            questionText: q.questionText,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        }
      }
    });

    return { success: true, testId: test.id };
  } catch (error: any) {
    console.error("Generate test error:", error);
    return { success: false, error: error.message };
  }
}

export async function submitAndGradeTest(testId: string, answers: Record<string, string>) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true, topic: true }
    });
    if (!test) throw new Error("Test not found");

    let correctCount = 0;
    
    for (const q of test.questions) {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      
      await prisma.question.update({
        where: { id: q.id },
        data: { userAnswer, isCorrect }
      });
    }

    const score = Math.round((correctCount / test.questions.length) * 100);

    await prisma.test.update({
      where: { id: testId },
      data: { score }
    });

    // Award XP and Leveling
    if (score >= 70) {
        const user = await prisma.user.findUnique({ where: { id: test.userId } });
        if (user) {
            let newExp = user.exp + 50;
            let newLevel = user.level;
            
            if (newExp >= 100) {
                newLevel += Math.floor(newExp / 100);
                newExp = newExp % 100;
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { exp: newExp, level: newLevel }
            });
        }
    }

    let revisionCreated = false;

    if (score < 70 && test.topic) {
      const topic = test.topic;
      const failedQuestions = test.questions.filter(q => answers[q.id] !== q.correctAnswer);
      const revisionDetails = "Failed concepts: " + failedQuestions.map(q => q.questionText).join(" | ");

      await prisma.topic.create({
        data: {
          subjectId: topic.subjectId,
          name: `Revision: ${topic.name}`,
          description: "Revision required due to low test score.",
          weekNumber: (topic.weekNumber || 1) + 1,
          estimatedHours: 1,
          activeLearningStrategy: `Review these missing concepts: ${revisionDetails}`,
          originalTopicId: topic.originalTopicId || topic.id
        }
      });
      revisionCreated = true;
    }

    return { success: true, score, revisionCreated };
  } catch (error: any) {
    console.error("Submit test error:", error);
    return { success: false, error: error.message };
  }
}

