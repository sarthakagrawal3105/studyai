"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { syncUser, getUserByEmail } from "@/app/actions/user";

// Define the context geometry
interface AuthContextType {
  user: User | null;
  prismaUser: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  prismaUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [prismaUser, setPrismaUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initial Auth Mount: Runs once on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Only sync if we haven't already for this user
        const res = await syncUser({
          email: currentUser.email,
          name: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber
        });
        if (res.success) {
          setPrismaUser(res.user);
        }
      } else {
        setPrismaUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Route Protection: Runs on route changes
  useEffect(() => {
    if (loading) return;

    const protectedRoutes = ["/dashboard", "/planner", "/tests", "/notes", "/tutor", "/settings"];
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

    if (!user && isProtectedRoute) {
      router.push("/login");
    }

    if (user && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [pathname, user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, prismaUser, loading }}>
        {children}
    </AuthContext.Provider>
  );
};
