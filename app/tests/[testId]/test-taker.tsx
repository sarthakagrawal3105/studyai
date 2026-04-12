"use client";

import { useState } from "react";
import { submitAndGradeTest } from "@/app/actions/planner";
import { CheckCircle2, XCircle, ArrowLeft, BrainCircuit, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type Question = {
  id: string;
  questionText: string;
  optionsList: string[];
  correctAnswer: string;
  explanation: string | null;
  userAnswer: string | null;
  isCorrect: boolean | null;
};

type TestData = {
  id: string;
  title: string;
  score: number | null;
  questions: Question[];
  topic: any;
};

export default function TestTaker({ test }: { test: TestData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(test.score !== null);
  const [resultScore, setResultScore] = useState<number | null>(test.score);
  const [revisionAdded, setRevisionAdded] = useState(false);

  // If already taken, fill answers state from database info
  useState(() => {
    if (isCompleted) {
      const initialAnswers: Record<string, string> = {};
      test.questions.forEach(q => {
        if (q.userAnswer) {
          initialAnswers[q.id] = q.userAnswer;
        }
      });
      setAnswers(initialAnswers);
    }
  });

  const handleSelectOption = (questionId: string, option: string) => {
    if (isCompleted) return; // Disallow changes after submission
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    // Validate if all questions answered
    if (Object.keys(answers).length < test.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitAndGradeTest(test.id, answers);
    setIsSubmitting(false);

    if (res.success) {
      setIsCompleted(true);
      setResultScore(res.score ?? null);
      setRevisionAdded(res.revisionCreated ?? false);
      toast.success("Test Graded!");
      
      if (res.revisionCreated) {
        toast("A Revision topic has been added to your next week's plan.", { icon: "📈", duration: 5000 });
      }
    } else {
      toast.error(res.error || "Failed to grade test.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pt-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/tests" className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 w-fit transition-colors font-medium mb-6">
        <ArrowLeft size={16} /> Back to Tests Hub
      </Link>

      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/5 mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
          <BrainCircuit className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10" size={150} />
          <div className="relative z-10">
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 inline-block">
                {test.topic?.subject?.name || "Topic Test"}
             </span>
             <h1 className="text-3xl font-black mb-2">{test.title}</h1>
             <p className="text-indigo-100 italic">{test.topic?.name}</p>
          </div>
        </div>

        {isCompleted && (
          <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-2">Final Score</h2>
            <div className={`text-6xl font-black mb-4 flex items-baseline gap-2 ${resultScore! >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {resultScore}% <span className="text-2xl text-slate-400 font-bold"></span>
            </div>
            {resultScore! < 70 ? (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 max-w-lg text-rose-600 dark:text-rose-400 font-medium flex items-start gap-3 text-left">
                <RefreshCw className="shrink-0 mt-0.5" size={20} />
                <p>We've detected you struggled on a few foundational concepts. A <strong>Revision Session</strong> has been automatically slotted into your plan for next week.</p>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 px-6 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 size={20} /> Excellent work! You passed this topic.
              </div>
            )}
          </div>
        )}

        <div className="p-8 flex flex-col gap-10">
          {test.questions.map((q, idx) => {
            const userAnswer = isCompleted ? (q.userAnswer || answers[q.id]) : answers[q.id];
            const isQCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={q.id} className="flex flex-col gap-4">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-start gap-3">
                    <span className="flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-full shrink-0 text-sm font-black">
                      {idx + 1}
                    </span>
                    <span className="mt-1 leading-relaxed">{q.questionText}</span>
                 </h3>

                 <div className="pl-11 flex flex-col gap-3">
                   {q.optionsList.map((opt, o_idx) => {
                     const isSelected = userAnswer === opt;
                     const isCorrectAns = q.correctAnswer === opt;
                     
                     let bgClass = "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-gray-200 dark:border-gray-700";
                     let textClass = "text-slate-700 dark:text-slate-300";
                     
                     if (isCompleted) {
                       if (isCorrectAns) {
                         bgClass = "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 border-2";
                         textClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                       } else if (isSelected && !isCorrectAns) {
                         bgClass = "bg-rose-50 dark:bg-rose-500/20 border-rose-500 border-2";
                         textClass = "text-rose-700 dark:text-rose-400 opacity-80 font-bold line-through decoration-rose-500/50";
                       } else {
                         bgClass = "bg-slate-50 dark:bg-slate-800 border-transparent opacity-50";
                       }
                     } else {
                       if (isSelected) {
                         bgClass = "bg-indigo-50 border-indigo-500 dark:bg-indigo-500/20 dark:border-indigo-500 border-2";
                         textClass = "text-indigo-700 dark:text-indigo-300 font-bold";
                       }
                     }

                     return (
                       <button
                         key={o_idx}
                         disabled={isCompleted}
                         onClick={() => handleSelectOption(q.id, opt)}
                         className={`w-full text-left p-4 rounded-xl border transition-all ${bgClass}`}
                       >
                         <span className={textClass}>{opt}</span>
                       </button>
                     );
                   })}
                 </div>

                 {isCompleted && (
                   <div className="pl-11 mt-2">
                     <div className={`p-4 rounded-xl border flex items-start gap-3 ${isQCorrect ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
                        {isQCorrect ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="text-rose-500 shrink-0 mt-0.5" />}
                        <div>
                          <h4 className={`font-bold mb-1 ${isQCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {isQCorrect ? "Correct!" : "Incorrect"}
                          </h4>
                          {q.explanation && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">{q.explanation}</p>
                          )}
                        </div>
                     </div>
                   </div>
                 )}
              </div>
            );
          })}
        </div>

        {!isCompleted ? (
          <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-[#151c2c] sticky bottom-0 z-20 flex justify-end items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="text-slate-500 dark:text-slate-400 font-medium mr-6">
               {Object.keys(answers).length} of {test.questions.length} answered
            </div>
            <button
               disabled={isSubmitting}
               onClick={handleSubmit}
               className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
            >
               {isSubmitting ? "Grading Test..." : "Submit Test"} 
            </button>
          </div>
        ) : (
          <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-[#151c2c] sticky bottom-0 z-20 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="text-slate-500 dark:text-slate-400 font-medium italic">
               Reviewing completed test
            </div>
            <Link
               href="/tests"
               className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/30 flex items-center gap-2"
            >
               Finish & Return to Hub
               <ChevronRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
