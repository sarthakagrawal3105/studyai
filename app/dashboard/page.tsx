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
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Loader2,
  ChevronRight,
  TrendingUp,
  Award,
  CircleCheck,
  Zap,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 bg-[#020617]">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-500 opacity-20" />
        <Loader2 className="h-16 w-16 animate-spin text-indigo-400 absolute top-0 left-0" style={{ animationDuration: '3s' }} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white text-xl font-black tracking-widest uppercase">Initializing Neural Link</p>
        <p className="text-slate-500 font-medium animate-pulse">Syncing your cognitive progress...</p>
      </div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 relative overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10"
      >
        
        {/* TOP NAV / PROFILE BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Nexus <span className="text-indigo-500">Dashboard</span>
            </h1>
            <p className="text-slate-500 font-medium">Welcome back, {data?.user?.name || "Innovator"} 👋</p>
          </div>
          
          {/* LEVEL & XP PILL */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2 pl-4 rounded-full self-start md:self-center shadow-2xl">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Level {data?.user?.level}</span>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(data?.user?.exp % 100)}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-400" 
                />
              </div>
            </div>
            <div className="bg-indigo-600 p-3 rounded-full text-white shadow-lg shadow-indigo-500/20">
              <Trophy size={20} />
            </div>
          </div>
        </header>

        {/* VITAL STATS RIBBON */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Brain Power", val: `${data?.user?.level || 1}`, sub: "Current LVL", icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Study Streak", val: `${data?.stats?.streak || 0}`, sub: "Active Days", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Cognitive Mastery", val: `${data?.stats?.mastery || 0}%`, sub: "Syllabus Plan", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Global Accuracy", val: `${data?.stats?.averageScore || 0}%`, sub: "Test Metrics", icon: CircleCheck, color: "text-indigo-400", bg: "bg-indigo-400/10" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className="group p-5 bg-white/5 backdrop-blur-md border border-white/5 rounded-[28px] hover:bg-white/10 transition-all hover:scale-[1.02] cursor-default"
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-none">{stat.val}</div>
                  <div className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold mt-1">{stat.sub}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID: 2 COLUMNS (PRIMARY FOCUS + SECONDARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: 8 COLUMNS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* FOCUS TOPIC: THE "NERVE CENTER" */}
            <motion.section 
              variants={itemVariants}
              className="relative p-8 rounded-[40px] bg-indigo-600 shadow-2xl shadow-indigo-500/10 overflow-hidden group border border-white/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Primary Cognitive Focus
                </div>
                
                {data?.nextTopic ? (
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        {data.nextTopic.name}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                          {data.nextTopic.subjectName}
                        </span>
                        <span className="text-indigo-200 text-sm font-medium">Ready for Mastery</span>
                      </div>
                    </div>
                    <Link href="/planner" className="flex items-center gap-3 bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black text-sm hover:gap-5 transition-all w-fit">
                      RESUME PLAN <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-white text-xl font-bold opacity-80 py-4">
                    Your syllabus is currently empty. Start by uploading a PDF!
                  </div>
                )}
              </div>
            </motion.section>

            {/* SUBJECT MASTERY GRID */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                Subject Mastery Grid <Award size={20} className="text-emerald-400" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.subjectStats?.map((subject: any, i: number) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    className="p-6 bg-white/5 border border-white/5 rounded-[32px] group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-lg">{subject.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{subject.completedTopics}/{subject.totalTopics} Topics Completed</p>
                      </div>
                      <div className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tight",
                        subject.trending === 'UP' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                      )}>
                        {subject.trending === 'UP' ? "Trending Up 📈" : "Stable ➖"}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-2 relative z-10">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Completion</span>
                        <span>{subject.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-blue-500" 
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Accuracy</span>
                       <span className="text-white font-bold">{subject.latestScore || 0}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: 4 COLUMNS */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* AI BRIEFING CARD */}
            <motion.div 
              variants={itemVariants}
              className="p-8 pb-10 rounded-[40px] bg-gradient-to-br from-indigo-950/50 to-slate-900/50 border border-white/5 relative overflow-hidden group shadow-xl"
            >
              <div className="absolute top-0 right-0 p-6 text-indigo-500/20 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
                <Sparkles size={64} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="font-black text-white">AI Study Insights</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                  "{data?.aiBriefing}"
                </p>
              </div>
            </motion.div>

            {/* ASSESSMENT QUEUE */}
            <div className="space-y-4">
               <h3 className="text-xs uppercase tracking-[0.3em] font-black text-slate-500 px-2">Assessment Queue</h3>
               <div className="space-y-3">
                  {data?.pendingAssessments?.length > 0 ? data.pendingAssessments.map((test: any, i: number) => (
                    <motion.div 
                      key={i}
                      variants={itemVariants}
                      className="p-4 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-500/10 text-orange-400 p-3 rounded-2xl">
                          <Zap size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{test.title}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Topic: {test.topicName}</div>
                        </div>
                      </div>
                      <Link href={`/test/${test.id}`} className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <ChevronRight size={18} />
                      </Link>
                    </motion.div>
                  )) : (
                    <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <div className="text-slate-600 text-[10px] font-bold uppercase mb-2">Queue Clear</div>
                        <p className="text-xs text-slate-500">No pending assessments.</p>
                    </div>
                  )}
               </div>
            </div>

            {/* GROWTH ANALYTICS (SMALL GRAPH) */}
            <motion.div 
              variants={itemVariants}
              className="p-8 bg-[#111827]/50 border border-white/5 rounded-[40px] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-white text-sm uppercase tracking-wider">Growth Trends</h3>
                <BarChart3 size={18} className="text-emerald-400" />
              </div>
              <div className="h-32 mb-6">
                <ProgressChart />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Learning Velocity</span>
                  <span className="text-emerald-400 text-xs font-black">+14% Weekly</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="w-[70%] h-full bg-emerald-500" />
                </div>
              </div>
            </motion.div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
