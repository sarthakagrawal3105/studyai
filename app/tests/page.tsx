import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ClipboardList, CheckCircle2, Circle } from "lucide-react";

export default async function TestsPage() {
  const userId = "user_123";
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: {
      topics: {
        include: { tests: true }
      }
    }
  });

  const subjectsWithTests = subjects.map(s => {
    const tests = s.topics.flatMap(t => t.tests);
    return { ...s, allTests: tests };
  }).filter(s => s.allTests.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">Tests Hub</h1>

      {subjectsWithTests.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] shadow-xl border border-gray-100 dark:border-white/5 rounded-3xl p-10 text-center">
          <p className="text-slate-500">No tests available yet. Mark some topics as completed in your plans to generate AI tests!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-20">
          {subjectsWithTests.map(subject => (
            <div key={subject.id} className="bg-white dark:bg-[#151c2c] shadow-xl border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden p-6">
              <h2 className="text-2xl font-bold dark:text-white mb-4 flex items-center gap-2">
                <ClipboardList className="text-indigo-500"/>
                {subject.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subject.allTests.map((test: any) => (
                  <Link href={`/tests/${test.id}`} key={test.id} className="block group">
                    <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all cursor-pointer shadow-sm hover:shadow-md relative h-full flex flex-col justify-between">
                       <h3 className="font-bold text-slate-900 dark:text-slate-200 text-lg mb-2 line-clamp-2 pr-2">{test.title}</h3>
                       <div className="flex justify-between items-center mt-4">
                          {test.score !== null ? (
                             <span className={`font-black text-lg ${test.score >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>Score: {test.score}%</span>
                          ) : (
                             <span className="text-indigo-500 font-semibold flex items-center gap-2"><Circle size={16}/> Needs Action</span>
                          )}
                          <ChevronRight className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
