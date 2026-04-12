"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  ClipboardList, 
  CheckCircle2, 
  Circle, 
  History, 
  LayoutGrid, 
  Clock,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Test = {
  id: string;
  title: string;
  score: number | null;
  createdAt: string | Date;
};

type Subject = {
  id: string;
  name: string;
  allTests: Test[];
};

export default function TestsHub({ subjectsWithTests }: { subjectsWithTests: Subject[] }) {
  const [view, setView] = useState<"available" | "history">("available");

  // Filter tests based on view
  const filteredSubjects = subjectsWithTests.map(s => {
    const tests = s.allTests.filter(t => 
      view === "available" ? t.score === null : t.score !== null
    );
    return { ...s, tests };
  }).filter(s => s.tests.length > 0);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-full px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 mt-6">
        <div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <LayoutGrid className="text-indigo-600" size={36} />
             Tests Hub
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
             {view === "available" 
               ? "Practice and master your topics with AI-generated assessments." 
               : "Review your past performance and track your growth."}
           </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-fit self-end md:self-center">
           <button
             onClick={() => setView("available")}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
               view === "available" 
                 ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md" 
                 : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
             }`}
           >
             <ClipboardList size={18} /> Available
           </button>
           <button
             onClick={() => setView("history")}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
               view === "history" 
                 ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md" 
                 : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
             }`}
           >
             <History size={18} /> History
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={view}
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           exit="exit"
           className="min-h-[400px]"
        >
          {filteredSubjects.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-[#111827] shadow-xl border border-gray-100 dark:border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center max-w-2xl mx-auto mt-10"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                {view === "available" ? <ClipboardList size={40} /> : <History size={40} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {view === "available" ? "All caught up!" : "No history yet"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                {view === "available" 
                  ? "You don't have any pending tests. Complete more topics in your study plan to generate new AI assessments." 
                  : "You haven't completed any tests yet. Take an available test to start building your academic history!"}
              </p>
              {view === "history" && (
                 <button 
                   onClick={() => setView("available")}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform flex items-center gap-2"
                 >
                   View Available Tests
                   <ArrowLeft size={18} />
                 </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col gap-10 pb-20">
              {filteredSubjects.map(subject => (
                <motion.div 
                  key={subject.id} 
                  variants={itemVariants}
                  className="bg-white dark:bg-[#151c2c] shadow-xl border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden p-8"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-white/5 pb-4">
                    <h2 className="text-3xl font-black dark:text-white flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <ClipboardList size={24} />
                      </div>
                      {subject.name}
                    </h2>
                    <span className="text-sm font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full uppercase tracking-widest">
                      {subject.tests.length} {subject.tests.length === 1 ? 'Test' : 'Tests'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subject.tests.map((test) => (
                      <Link href={`/tests/${test.id}`} key={test.id} className="block group h-full">
                        <div className="h-full bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-[#1a2333] transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-1 relative duration-300 flex flex-col justify-between overflow-hidden">
                           {/* Decorative background element */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>

                           <div>
                              <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                <Clock size={12} />
                                {view === "history" ? new Date(test.createdAt).toLocaleDateString() : "New Assessment"}
                              </div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-6 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{test.title}</h3>
                           </div>

                           <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                              {test.score !== null ? (
                                 <div className="flex flex-col">
                                   <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Result</span>
                                   <span className={`font-black text-2xl ${test.score >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                     {test.score}%
                                   </span>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-widest">
                                   <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                   Pending
                                 </div>
                              )}
                              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all rotate-0 group-hover:rotate-0 transform">
                                <ChevronRight size={20} />
                              </div>
                           </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
