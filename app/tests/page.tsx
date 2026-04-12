"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import TestsHub from "./tests-hub";

export default function TestsPage() {
  const { prismaUser, loading: authLoading } = useAuth();
  const [subjectsWithTests, setSubjectsWithTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      if (prismaUser) {
        setLoading(true);
        const data = await getDashboardData(prismaUser.id);
        if (data && data.user && data.user.subjects) {
          const subjects = data.user.subjects.map((s: any) => {
            const tests = s.topics.flatMap((t: any) => t.tests);
            return { 
              id: s.id, 
              name: s.name, 
              allTests: tests.map((t: any) => ({
                id: t.id,
                title: t.title,
                score: t.score,
                createdAt: t.createdAt
              }))
            };
          }).filter((s: any) => s.allTests.length > 0);
          setSubjectsWithTests(subjects);
        }
        setLoading(false);
      }
    }
    fetchTests();
  }, [prismaUser]);

  if (authLoading || loading) return (
    <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-500 h-10 w-10" />
            <p className="text-slate-500 font-medium italic animate-pulse">Syncing your neural records...</p>
        </div>
    </div>
  );

  return <TestsHub subjectsWithTests={subjectsWithTests} />;
}
