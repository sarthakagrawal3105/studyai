"use client";

import { useState, useRef } from "react";
import { generateSyllabusPlan, saveSyllabusPlan } from "@/app/actions/planner";
import { UploadCloud, FileText, Loader2, Sparkles, ChevronDown, Clock, BrainCircuit, Calendar, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Topic = {
  title: string;
  description: string;
  estimatedHours: number;
  activeLearningStrategy: string;
};

type WeekPlan = {
  weekNumber: number;
  theme: string;
  topics: Topic[];
};

type SyllabusPlan = {
  totalWeeks: number;
  weeks: WeekPlan[];
};

function ExpandableTopicCard({ topic, index }: { topic: Topic; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-white dark:bg-[#151c2c] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isExpanded ? 'bg-indigo-500' : 'bg-transparent'} transition-colors duration-300`} />
      
      <motion.div layout className="p-6 flex items-start gap-4">
        <div className={`w-10 h-10 shrink-0 rounded-full font-bold flex items-center justify-center transition-colors ${
          isExpanded 
            ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        }`}>
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {topic.title}
            </h4>
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full shrink-0">
              <Clock size={14} />
              {topic.estimatedHours}h
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            {topic.description}
          </p>
        </div>
        <motion.div 
          animate={{ rotate: isExpanded ? 180 : 0 }} 
          className={`shrink-0 mt-2 transition-colors ${isExpanded ? 'text-indigo-500' : 'text-slate-400'}`}
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
            className="border-t border-gray-100 dark:border-white/5 bg-indigo-50/50 dark:bg-[#111827]"
          >
            <div className="p-6 md:pl-20">
              <h5 className="font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                <BrainCircuit size={18} />
                Active Learning Strategy
              </h5>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{topic.activeLearningStrategy}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PlannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SyllabusPlan | null>(null);
  
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // New State variables for configuration ranges
  const [targetWeeks, setTargetWeeks] = useState("");
  const [targetHours, setTargetHours] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast.error("Please upload a valid PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a valid PDF file.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);
    setPlan(null);
    
    try {
      const formData = new FormData();
      formData.append("syllabusPdf", file);
      
      // Append strictly user inputs (optional)
      if (targetWeeks.trim() !== "") formData.append("targetWeeks", targetWeeks);
      if (targetHours.trim() !== "") formData.append("targetHours", targetHours);

      const res = await generateSyllabusPlan(formData);
      
      if (res.success && res.plan && res.plan.weeks) {
        setPlan(res.plan);
        toast.success("Timeline generated successfully!");
      } else {
        toast.error(res.error || "Failed to structure plan. Try another PDF.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan || !file) return;
    setIsSaving(true);
    // Use a placeholder userId for testing
    const res = await saveSyllabusPlan(plan, "user_123", file.name);
    setIsSaving(false);
    
    if (res.success) {
      toast.success("Plan saved! Let's get to work.");
      router.push('/plans');
    } else {
      toast.error(res.error || "Failed to save plan.");
    }
  };

  const resetPlanner = () => {
    setFile(null);
    setPlan(null);
    setTargetWeeks("");
    setTargetHours("");
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Syllabus Planner <Sparkles className="text-amber-500" />
        </h1>
        {plan && (
          <div className="flex items-center gap-3">
            <button 
              onClick={resetPlanner}
              className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Upload New
            </button>
            <button 
              onClick={handleSavePlan}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle size={16} />
              {isSaving ? "Saving..." : "Accept & Save Plan"}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!plan ? (
          <motion.div 
            key="upload-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className={`p-12 relative overflow-hidden rounded-3xl shadow-xl transition-all duration-300 border-2 ${
              isDragActive 
                ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 scale-[1.02]" 
                : file 
                  ? "border-emerald-500 bg-white dark:bg-[#111827]" 
                  : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#111827] border-dashed"
            } flex flex-col items-center justify-center text-center mt-8`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />

            {loading ? (
               <div className="flex flex-col items-center animate-in zoom-in duration-500 py-8">
                 <div className="w-24 h-24 relative mb-6">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-bold dark:text-white mb-2">Architecting your plan...</h2>
                 <p className="text-slate-500 max-w-sm">Applying your constraints and extracting core topics. This takes a few seconds.</p>
               </div>
            ) : !file ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                    <UploadCloud size={40} />
                </div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Define Your Journey</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Upload your syllabus PDF. We'll map out a structured timeline and give you active learning strategies to conquer it.
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-slate-500/25 hover:-translate-y-1 transition-all"
                >
                    Browse Files
                </button>
              </div>
            ) : (
               <div className="flex flex-col items-center py-10 w-full">
                 <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-500">
                    <FileText size={40} />
                 </div>
                 <h2 className="text-2xl font-bold dark:text-white mb-2">{file.name}</h2>
                 <p className="text-slate-500 mb-8 font-mono text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB Payload Ready</p>
                 
                 {/* Configuration Inputs */}
                 <div className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-xl mx-auto">
                    <div className="flex-1 text-left relative">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Target Duration (Weeks)</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           type="text"
                           placeholder="e.g. 8 or 6-8 (Optional)"
                           value={targetWeeks}
                           onChange={(e) => setTargetWeeks(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-left relative">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Total Time Budget</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           type="text"
                           placeholder="e.g. 50 hrs or 60-70 (Optional)"
                           value={targetHours}
                           onChange={(e) => setTargetHours(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => setFile(null)}
                      className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                      onClick={handleGenerate}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        Generate Timeline <Sparkles size={20} />
                    </button>
                 </div>
               </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="timeline-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-12 mt-6 relative"
          >
            <div className="p-10 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10">
                  <Calendar size={250} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight">Your {plan.totalWeeks}-Week Roadmap</h3>
                    <p className="text-white/80 max-w-lg text-lg">
                      We've analyzed your syllabus and structured it into an actionable timeline focused on deep learning.
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <div className="text-sm font-medium text-white/70 mb-1 uppercase tracking-wider">Total Time Investment</div>
                    <div className="text-4xl font-black flex items-end gap-2">
                       {plan.weeks.reduce((acc, week) => acc + week.topics.reduce((t_acc, topic) => t_acc + topic.estimatedHours, 0), 0)}<span className="text-2xl text-white/50">hrs</span>
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-12 relative xl:-ml-4">
              <div className="hidden xl:block absolute left-8 top-4 bottom-0 w-1 bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent rounded-full z-0" />

              {plan.weeks.map((week, w_idx) => (
                <div key={w_idx} className="relative z-10 flex flex-col xl:flex-row gap-6 xl:gap-12 group">
                  <div className="xl:w-48 shrink-0 flex xl:flex-col items-center xl:items-start gap-4 xl:gap-2">
                    <div className="hidden xl:flex w-16 h-16 rounded-2xl bg-white dark:bg-[#111827] border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] items-center justify-center transform group-hover:scale-110 transition-transform -ml-4 z-10">
                      <span className="font-black text-2xl text-indigo-600 dark:text-indigo-400">{week.weekNumber}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-wider text-indigo-500 uppercase xl:mt-2">Week {week.weekNumber}</span>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1 leading-tight">{week.theme}</h3>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    {week.topics.map((topic, t_idx) => (
                      <ExpandableTopicCard key={t_idx} topic={topic} index={t_idx} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
