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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync user with database and store the prisma user profile
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

      // Simple route protection logic
      const protectedRoutes = ["/dashboard", "/planner", "/tests", "/notes", "/tutor", "/settings"];
      const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

      if (!currentUser && isProtectedRoute) {
        router.push("/login");
      }

      if (currentUser && pathname === "/login") {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, prismaUser, loading }}>
        {children}
    </AuthContext.Provider>
  );
};
