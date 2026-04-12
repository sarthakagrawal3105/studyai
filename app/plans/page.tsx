"use client";

import { useEffect, useState } from "react";
import { getPlans, deletePlan } from "@/app/actions/plans";
import { useAuth } from "@/components/auth-provider";
import { BookOpen, FolderOpen, Trash2, Clock, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const { prismaUser, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPlans = async () => {
    if (!prismaUser) return;
    setLoading(true);
    const data = await getPlans(prismaUser.id);
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    if (prismaUser) {
      fetchPlans();
    }
  }, [prismaUser]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!prismaUser) return;
    
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    const toastId = toast.loading("Deleting plan...");
    const res = await deletePlan(id, prismaUser.id);
    
    if (res.success) {
      toast.success("Plan deleted successfully!", { id: toastId });
      setPlans(plans.filter(p => p.id !== id));
    } else {
      toast.error(res.error || "Failed to delete plan", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          My Plans <FolderOpen className="text-fuchsia-500" size={36} />
        </h1>
        <Link 
          href="/planner"
          className="px-6 py-3 text-sm font-bold bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl transition-colors shadow-lg shadow-fuchsia-500/20"
        >
          Create New Plan
        </Link>
      </div>

      {loading || authLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#151c2c] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="w-24 h-24 bg-fuchsia-100 dark:bg-fuchsia-500/10 rounded-full flex items-center justify-center mb-6 text-fuchsia-500">
            <BookOpen size={40} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">No Plans Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto text-center mb-8">
            You haven't generated any study plans yet. Head over to the Planner to upload a syllabus and get started!
          </p>
          <Link 
            href="/planner"
            className="px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
          >
            Go to Planner
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {plans.map((plan, index) => {
              const completedTopics = plan.topics.filter((t: any) => t.isCompleted).length;
              const totalTopics = plan.topics.length;
              const progressCount = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/plans/${plan.id}`}>
                    <div className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden h-full flex flex-col">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-2xl text-fuchsia-600 dark:text-fuchsia-400">
                          <FolderOpen size={24} />
                        </div>
                        <button 
                          onClick={(e) => handleDelete(plan.id, e)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2" title={plan.name}>
                        {plan.name}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {plan.totalWeeks} Weeks
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {plan.targetHours} Hours
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between text-sm font-semibold mb-2">
                          <span className="text-slate-700 dark:text-slate-300">Progress</span>
                          <span className="text-fuchsia-600 dark:text-fuchsia-400">{progressCount}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000" 
                            style={{ width: `${progressCount}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 text-right">
                          {completedTopics} of {totalTopics} topics completed
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
