"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getDashboardData } from "@/app/actions/dashboard";
import ProgressChart from "@/components/progress-chart";
import { 
  Brain, 
  Flame, 
  Target, 
  Trophy, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Loader2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { prismaUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (prismaUser) {
        setLoading(true);
        const dashboardData = await getDashboardData(prismaUser.id);
        setData(dashboardData);
        setLoading(false);
      }
    }
    load();
  }, [prismaUser]);

  if (authLoading || loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      <p className="text-slate-500 font-medium animate-pulse">Syncing your progress...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HERO SECTION: AI Briefing */}
      <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-[#0B0F19] to-slate-900 border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-indigo-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.2em] text-xs mb-4">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
             AI Daily Briefing
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Welcome back, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              {prismaUser?.name || "Innovator"} 🚀
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
            "{data?.aiBriefing || "Your path to mastery continues today. Let's make every minute count."}"
          </p>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Brain Power", val: `${prismaUser?.level || 1}`, sub: "Level", icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Study Streak", val: "4", sub: "Days", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Mastery Index", val: `${data?.masteryPercentage || 0}%`, sub: "Syllabus", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Total Points", val: `${prismaUser?.exp || 0}`, sub: "EXP", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[#111827]/50 backdrop-blur-sm border border-white/5 rounded-3xl flex flex-col gap-1 group hover:border-white/10 transition-all cursor-default"
          >
            <div className={`p-3 rounded-2xl w-fit ${stat.bg} ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{stat.val}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN LAYOUT: FEED + ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Priority Path (Feed) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              Your Priority Path <Award className="text-indigo-500" size={24} />
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data?.priorityCards?.length > 0 ? (
              data.priorityCards.map((card: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="group relative p-6 bg-white dark:bg-[#111827] border border-white/5 rounded-[32px] hover:border-indigo-500/50 transition-all overflow-hidden cursor-pointer"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -mr-8 -mt-8 ${card.type === 'CORRECT' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex gap-5 items-start">
                      <div className={`p-4 rounded-2xl ${card.bg} ${card.subjectColor}`}>
                        {card.type === "CORRECT" ? <TrendingUp size={24} /> : <BookOpen size={24} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                        <p className="text-slate-400 text-sm max-w-md">{card.description}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex p-3 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
                <div className="p-12 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                    <Sparkles className="mx-auto text-indigo-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                    <p className="text-slate-400">Add more topics to your Syllabus Planner to see new priority cards.</p>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar Highlights */}
        <div className="space-y-6">
          <div className="p-8 bg-[#111827] border border-white/5 rounded-[40px] shadow-xl">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-white">Daily Growth</h3>
                <TrendingUp size={20} className="text-emerald-400" />
             </div>
             <div className="h-48">
                <ProgressChart />
             </div>
             <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Analyzing your mastery over 7 days. You are currently at your peak growth—keep the momentum!
                </p>
             </div>
          </div>

          <div className="p-8 bg-[#0B0F19] border border-green-500/10 rounded-[40px] relative overflow-hidden group">
             <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                    <BookOpen size={20} />
                </div>
                <h3 className="font-bold text-white">Recent Scans</h3>
             </div>
             <div className="space-y-4">
                {data?.recentNotes?.length > 0 ? data.recentNotes.map((note: any, i: number) => (
                    <Link href="/notes" key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                        <span className="text-sm font-medium text-slate-300 truncate max-w-[150px]">{note.title}</span>
                        <ChevronRight size={14} className="text-slate-600" />
                    </Link>
                )) : (
                    <p className="text-xs text-slate-600">No notes scanned yet. Head to Study Lens!</p>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
