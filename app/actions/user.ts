"use server"

import prisma from "@/lib/prisma"

export async function syncUser(userData: {
  email?: string | null;
  phoneNumber?: string | null;
  name?: string | null;
}) {
  try {
    // If we have email, use that as primary key, otherwise use phone
    const where = userData.email 
      ? { email: userData.email } 
      : { phoneNumber: userData.phoneNumber || "" };

    const user = await prisma.user.upsert({
      where,
      update: {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
      },
      create: {
        email: userData.email,
        phoneNumber: userData.phoneNumber || null,
        name: userData.name,
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error("Error syncing user:", error);
    return { success: false, error: "Failed to sync user" };
  }
}
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}
