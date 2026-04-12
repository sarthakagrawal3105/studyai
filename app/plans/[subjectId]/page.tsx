"use client";

import { useEffect, useState, use } from "react";
import { getPlan, toggleTopicCompletion } from "@/app/actions/plans";
import { useAuth } from "@/components/auth-provider";
import { Clock, Calendar, CheckCircle2, Circle, ArrowLeft, BrainCircuit, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

type Topic = {
  id: string;
  name: string;
  description: string | null;
  weekNumber: number | null;
  estimatedHours: number | null;
  activeLearningStrategy: string | null;
  isCompleted: boolean;
};

type WeekGroup = {
  weekNumber: number;
  topics: Topic[];
};

export default function PlanDetailsPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { prismaUser, loading: authLoading } = useAuth();
  const unwrappedParams = use(params);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState<WeekGroup[]>([]);
  
  // Track expanded state for topics globally in this component
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (prismaUser) {
      fetchPlan();
    }
  }, [unwrappedParams.subjectId, prismaUser]);

  const fetchPlan = async () => {
    if (!prismaUser) return;
    setLoading(true);
    const data = await getPlan(unwrappedParams.subjectId, prismaUser.id);
    
    if (data && data.topics) {
      // Group topics by week
      const groupedWeeks: Record<number, WeekGroup> = {};
      
      data.topics.forEach((topic: Topic) => {
        const weekNum = topic.weekNumber || 1;
        if (!groupedWeeks[weekNum]) {
          groupedWeeks[weekNum] = { weekNumber: weekNum, topics: [] };
        }
        groupedWeeks[weekNum].topics.push(topic);
      });
      
      setWeeks(Object.values(groupedWeeks).sort((a, b) => a.weekNumber - b.weekNumber));
    }
    
    setPlan(data);
    setLoading(false);
  };

  const handleToggleCompletion = async (topicId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !currentStatus;
    
    // Optimsitic update
    const updatedWeeks = [...weeks];
    for (const week of updatedWeeks) {
      const topicIndex = week.topics.findIndex(t => t.id === topicId);
      if (topicIndex !== -1) {
        week.topics[topicIndex].isCompleted = newStatus;
        break;
      }
    }
    setWeeks(updatedWeeks);
    
    const res = await toggleTopicCompletion(topicId, newStatus);
    if (!res.success) {
      toast.error("Failed to update status");
      // Revert on failure
      fetchPlan();
    } else {
      if (newStatus) {
        toast.success("Topic marked as completed!");
      }
    }
  };

  const toggleTopicExpansion = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Plan not found</h2>
        <Link href="/plans" className="text-fuchsia-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to My Plans
        </Link>
      </div>
    );
  }

  const completedTopics = plan.topics.filter((t: any) => t.isCompleted).length;
  const progressCount = plan.topics.length > 0 ? Math.round((completedTopics / plan.topics.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/plans" className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 w-fit transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Plans
        </Link>
        
        <div className="p-10 bg-gradient-to-br from-fuchsia-600 to-purple-800 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Calendar size={250} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight">{plan.name}</h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <Calendar size={18} />
                  <span className="font-semibold">{plan.totalWeeks} Weeks</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <Clock size={18} />
                  <span className="font-semibold">{plan.targetHours} Total Hours</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-64 bg-white/10 p-5 rounded-2xl backdrop-blur-sm shadow-inner min-w-[200px]">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Progress</span>
                <span className="text-2xl font-black">{progressCount}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-green-400 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                  style={{ width: `${progressCount}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/70 mt-3 text-center">
                {completedTopics} of {plan.topics.length} topics completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-12 mt-6 relative xl:-ml-4">
        <div className="hidden xl:block absolute left-8 top-4 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500/50 via-purple-500/20 to-transparent rounded-full z-0" />

        {weeks.map((week, w_idx) => (
          <div key={week.weekNumber} className="relative z-10 flex flex-col xl:flex-row gap-6 xl:gap-12 group">
            <div className="xl:w-48 shrink-0 flex xl:flex-col items-center xl:items-start gap-4 xl:gap-2">
              <div className="hidden xl:flex w-16 h-16 rounded-2xl bg-white dark:bg-[#111827] border-2 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.2)] items-center justify-center transform group-hover:scale-110 transition-transform -ml-4 z-10">
                <span className="font-black text-2xl text-fuchsia-600 dark:text-fuchsia-400">{week.weekNumber}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-wider text-fuchsia-500 uppercase xl:mt-2">Week {week.weekNumber}</span>
                <div className="text-sm text-slate-500 font-medium">
                  {week.topics.filter(t => t.isCompleted).length} / {week.topics.length} completed
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {week.topics.map((topic, t_idx) => {
                const isExpanded = expandedTopics[topic.id] || false;
                
                return (
                  <motion.div 
                    layout
                    key={topic.id}
                    onClick={(e) => toggleTopicExpansion(topic.id, e)}
                    className={`bg-white dark:bg-[#151c2c] border ${topic.isCompleted ? 'border-emerald-500/30 dark:border-emerald-500/20' : 'border-gray-100 dark:border-white/5'} rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${topic.isCompleted ? 'bg-emerald-50/10' : ''}`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${topic.isCompleted ? 'bg-emerald-500' : isExpanded ? 'bg-fuchsia-500' : 'bg-transparent'} transition-colors duration-300`} />
                    
                    <motion.div layout className="p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Checkbox button */}
                      <button 
                        onClick={(e) => handleToggleCompletion(topic.id, topic.isCompleted, e)}
                        className={`shrink-0 mt-1 transition-all duration-300 rounded-full hover:scale-110 ${topic.isCompleted ? 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-300 hover:text-emerald-400'}`}
                      >
                        {topic.isCompleted ? <CheckCircle2 size={32} /> : <Circle size={32} strokeWidth={2} />}
                      </button>

                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <h4 className={`text-lg md:text-xl font-bold leading-tight ${topic.isCompleted ? 'text-slate-700 dark:text-slate-300 line-through decoration-slate-400/50' : 'text-slate-900 dark:text-white'}`}>
                            {topic.name}
                          </h4>
                          <div className="flex items-center gap-1 text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-3 py-1 rounded-full shrink-0">
                            <Clock size={14} />
                            {topic.estimatedHours}h
                          </div>
                        </div>
                        <p className={`mt-2 text-sm leading-relaxed ${topic.isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          {topic.description}
                        </p>
                      </div>
                      
                      <motion.div 
                        animate={{ rotate: isExpanded ? 180 : 0 }} 
                        className={`shrink-0 mt-2 sm:self-center transition-colors hidden sm:block ${isExpanded ? 'text-fuchsia-500' : 'text-slate-400'}`}
                      >
                        <ChevronDown size={24} />
                      </motion.div>
                    </motion.div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-100 dark:border-white/5 bg-fuchsia-50/50 dark:bg-[#111827]"
                        >
                          <div className="p-6 md:pl-20">
                            <h5 className="font-bold flex items-center gap-2 text-fuchsia-700 dark:text-fuchsia-400 mb-2">
                              <BrainCircuit size={18} />
                              Active Learning Strategy
                            </h5>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                              "{topic.activeLearningStrategy}"
                            </p>
                            
                            {!topic.isCompleted && (
                              <button 
                                onClick={(e) => handleToggleCompletion(topic.id, topic.isCompleted, e)}
                                className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                              >
                                <CheckCircle2 size={16} /> Mark as Completed
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
