import { prisma } from "@/lib/prisma";
import TestsHub from "./tests-hub";

export default async function TestsPage() {
  const userId = "user_123";
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: {
      topics: {
        include: { 
          tests: {
            orderBy: { createdAt: 'desc' }
          } 
        }
      }
    }
  });

  const subjectsWithTests = subjects.map(s => {
    const tests = s.topics.flatMap(t => t.tests);
    // Ensure we handle serialization of dates if needed or just pass the objects
    return { 
      id: s.id, 
      name: s.name, 
      allTests: tests.map(t => ({
        id: t.id,
        title: t.title,
        score: t.score,
        createdAt: t.createdAt.toISOString()
      }))
    };
  }).filter(s => s.allTests.length > 0);

  return <TestsHub subjectsWithTests={subjectsWithTests} />;
}
