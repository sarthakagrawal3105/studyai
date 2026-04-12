"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { analyzeStudyImage } from "@/app/actions/lens";
import { 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Scan,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function StudyLensPage() {
  const { prismaUser, loading: authLoading } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Image too large. Please keep it under 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !prismaUser) return;

    setIsAnalyzing(true);
    const toastId = toast.loading("AI is scanning your notes...");
    
    const res = await analyzeStudyImage(image, prismaUser.id);
    setIsAnalyzing(false);

    if (res.success) {
      setResult(res.data);
      toast.success("Analysis complete! Saved to Notes.", { id: toastId });
    } else {
      toast.error(res.error || "Failed to analyze image.", { id: toastId });
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  if (authLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          Study Lens <Scan className="text-indigo-500" />
        </h1>
        {image && (
          <button 
            onClick={reset}
            className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-10"
          >
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-[400px] border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-[50px] flex flex-col items-center justify-center bg-[#0c0c16] cursor-pointer transition-all overflow-hidden"
            >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <Camera size={48} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-white mb-2">Upload Study Material</h2>
                        <p className="text-slate-400 max-w-xs mx-auto">Snap a photo of your textbook, notes, or slides to instantly digitize and summarize them.</p>
                    </div>
                    <div className="px-6 py-3 bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-colors">
                        Select Image
                    </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6">
                    <div className="text-indigo-500 mb-3 flex justify-center"><FileText size={24} /></div>
                    <h4 className="font-bold text-white mb-1">OCR Powered</h4>
                    <p className="text-xs text-slate-500">Extracts text even from complex handwritten notes.</p>
                </div>
                <div className="p-6">
                    <div className="text-indigo-500 mb-3 flex justify-center"><Sparkles size={24} /></div>
                    <h4 className="font-bold text-white mb-1">AI Summary</h4>
                    <p className="text-xs text-slate-500">Get the core concepts without reading pages.</p>
                </div>
                <div className="p-6">
                    <div className="text-indigo-500 mb-3 flex justify-center"><CheckCircle2 size={24} /></div>
                    <h4 className="font-bold text-white mb-1">Auto-Archive</h4>
                    <p className="text-xs text-slate-500">Every scan is saved to your Smart Notes automatically.</p>
                </div>
            </div>
          </motion.div>
        ) : !result ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            <div className="flex-1 w-full bg-[#0c0c16] rounded-[40px] border border-white/5 p-4 overflow-hidden relative">
                <img src={image} className="w-full h-auto rounded-[32px] shadow-2xl" alt="Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            </div>

            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[40px]">
                    <h3 className="text-xl font-black text-white mb-2">Ready to scan?</h3>
                    <p className="text-sm text-slate-400 mb-8">Our AI will process this image to create study materials.</p>
                    
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                    </button>
                    
                    <button 
                        onClick={reset}
                        disabled={isAnalyzing}
                        className="w-full mt-3 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all disabled:opacity-50"
                    >
                        Change Image
                    </button>
                </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-white dark:bg-[#111827] rounded-[40px] border border-white/5 shadow-xl">
                    <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs mb-4">
                        <CheckCircle2 size={16} /> Analysis Result
                    </div>
                    <h2 className="text-3xl font-black text-white mb-6 leading-tight">{result.title}</h2>
                    
                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed mb-8">
                        {result.summary}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {result.keyTopics.map((topic: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-xl border border-indigo-500/20">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] flex items-center justify-between">
                    <div>
                        <h4 className="text-emerald-500 font-bold">Successfully Archived!</h4>
                        <p className="text-xs text-slate-400">This analysis has been saved to your Study Library.</p>
                    </div>
                    <Link href="/notes" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shrink-0">
                        View Note <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-8 bg-[#0c0c16] border border-white/5 rounded-[40px]">
                    <h3 className="text-xl font-black text-white mb-6">Study Questions</h3>
                    <div className="space-y-4">
                        {result.studyQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl text-sm text-slate-300 italic">
                                "{q}"
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={reset}
                        className="w-full mt-8 py-4 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        Scan New Page <Plus size={18} />
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import Link from "next/link";
