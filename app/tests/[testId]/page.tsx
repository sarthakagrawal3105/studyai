import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TestTaker from "./test-taker";

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const unwrappedParams = await params;
  
  const test = await prisma.test.findUnique({
    where: { id: unwrappedParams.testId },
    include: {
      questions: true,
      topic: {
        include: {
          subject: true
        }
      }
    }
  });

  if (!test) {
    notFound();
  }

  const parsedTest = {
    ...test,
    questions: test.questions.map(q => ({
      ...q,
      optionsList: JSON.parse(q.options) as string[]
    }))
  };

  return <TestTaker test={parsedTest} />;
}
