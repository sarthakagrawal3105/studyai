"use server";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DUMMY_USER_ID = "user_123";

export async function getPlans() {
  try {
    const plans = await prisma.subject.findMany({
      where: { userId: DUMMY_USER_ID },
      include: {
        topics: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return plans;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}

export async function getPlan(id: string) {
  try {
    const plan = await prisma.subject.findUnique({
      where: { id, userId: DUMMY_USER_ID },
      include: {
        topics: {
          orderBy: { weekNumber: 'asc' },
          include: { tests: { select: { id: true } } }
        }
      }
    });
    return plan;
  } catch (error) {
    console.error("Failed to fetch plan:", error);
    return null;
  }
}

export async function deletePlan(id: string) {
  try {
    await prisma.subject.delete({
      where: { id, userId: DUMMY_USER_ID }
    });
    revalidatePath("/plans");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete plan:", error);
    return { success: false, error: error.message };
  }
}

import { completeTopicAndGenerateTest } from "./planner";

export async function toggleTopicCompletion(topicId: string, isCompleted: boolean) {
  try {
    let testId: string | undefined;
    if (isCompleted) {
      const res = await completeTopicAndGenerateTest(topicId, DUMMY_USER_ID);
      if (!res.success) {
        await prisma.topic.update({
          where: { id: topicId },
          data: { isCompleted: false }
        });
        return { success: false, error: res.error };
      }
      if (res && res.testId) {
        testId = res.testId;
      }
    } else {
      await prisma.topic.update({
        where: { id: topicId },
        data: { isCompleted }
      });
    }
    return { success: true, testId };
  } catch (error: any) {
    console.error("Failed to toggle topic:", error);
    return { success: false, error: error.message };
  }
}
