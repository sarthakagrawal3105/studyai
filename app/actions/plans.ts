"use server";

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
          orderBy: { weekNumber: 'asc' }
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

export async function toggleTopicCompletion(topicId: string, isCompleted: boolean) {
  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: { isCompleted }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle topic:", error);
    return { success: false, error: error.message };
  }
}
