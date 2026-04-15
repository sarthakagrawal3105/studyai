"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Download, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Loader2,
  ChevronRight,
  X,
  RefreshCw,
  Zap,
  Award,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { getNotes, generateSmartNote, deleteNote, type NoteMode } from "@/app/actions/notes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, ScanSearch } from "lucide-react";

export default function SmartNotesPage() {
  const { prismaUser, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Handle mobile responsiveness for sidebars
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Creator State
  const [creatorMode, setCreatorMode] = useState<NoteMode>("TEACHER");
  const [topicInput, setTopicInput] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<"TOPIC" | "URL" | "TEXT">("TOPIC");
  const [examQuestion, setExamQuestion] = useState("");
  const [examMarks, setExamMarks] = useState("10");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prismaUser) {
      fetchNotes();
    }
  }, [prismaUser]);

  const fetchNotes = async () => {
    if (!prismaUser) return;
    setLoading(true);
    const data = await getNotes(prismaUser.id);
    setNotes(data);
    if (data.length > 0 && !selectedNote) {
      setSelectedNote(data[0]);
    }
    setLoading(false);
  };

  const handleCreateNote = async () => {
    if (!prismaUser) return;
    
    // Validation: CLEANER and COMPARE usually need raw context, others might just need topic
    // Validation: EXAM mode can proceed with just a question, others need topic or content
    if (creatorMode === "EXAM") {
        if (!topicInput && !examQuestion) {
            toast.error("Please enter a topic or a specific question.");
            return;
        }
    } else if (["TEACHER", "REVISION"].includes(creatorMode) && !topicInput) {
        toast.error("Please enter a topic.");
        return;
    }
    if (["CLEANER", "COMPARE"].includes(creatorMode) && !rawContent) {
        toast.error("Please provide the source text/content.");
        return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(creatorMode === "TEACHER" ? "Generating Master Note..." : "Processing toolkit...");
    
    let attachmentData = undefined;
    if (selectedFile) {
        // Convert to base64 (Browser compatible)
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(selectedFile);
        });
        
        const base64 = await base64Promise;
        attachmentData = {
            data: base64,
            mimeType: selectedFile.type
        };
    }
    
    const res = await generateSmartNote(
        topicInput || (creatorMode === "EXAM" ? examQuestion : "") || "Smart Note", 
        creatorMode, 
        prismaUser.id, 
        rawContent, 
        attachmentData,
        creatorMode === "EXAM" ? examQuestion : undefined,
        creatorMode === "EXAM" ? examMarks : undefined
    );
    setIsGenerating(false);

    if (res.success) {
      setNotes(prev => [res.note, ...prev]);
      setSelectedNote(res.note);
      setShowCreator(false);
      setTopicInput("");
      setRawContent("");
      toast.success("Note created!", { id: toastId });
    } else {
      toast.error(res.error || "Failed to generate note.", { id: toastId });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prismaUser || !confirm("Delete this note?")) return;
    
    const res = await deleteNote(id, prismaUser.id);
    if (res.success) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
          setSelectedNote(notes.filter(n => n.id !== id)[0] || null);
      }
      toast.success("Deleted");
    }
  };

  const exportToPDF = async () => {
    if (!selectedNote || !prismaUser) return;
    
    // Create a hidden temporary container for the branded PDF
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed";
    exportContainer.style.left = "-9999px";
    exportContainer.style.top = "0";
    exportContainer.style.width = "800px";
    exportContainer.style.backgroundColor = "white";
    exportContainer.style.padding = "40px";
    exportContainer.style.color = "#111827";
    document.body.appendChild(exportContainer);

    exportContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 40px; font-family: Inter, sans-serif;">
        <div style="display: flex; justify-between; items-center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
          <div style="display: flex; items-center; gap: 15px;">
            <img src="/logo.png" style="height: 60px; filter: none;" />
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase;">Verified Study Analysis</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${prismaUser.name || "StudyAI Scholar"}</div>
            <div style="font-size: 10px; color: #94a3b8;">${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        <div style="font-size: 14px; line-height: 1.6;">
            ${document.getElementById("note-content-raw")?.innerHTML || ""}
        </div>
        
        <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-align: center;">
            Generated by StudyAI &copy; ${new Date().getFullYear()} - Your Personal Knowledge Engineer
        </div>
      </div>
    `;

    const toastId = toast.loading("Engineered Branded PDF...");
    try {
      const canvas = await html2canvas(exportContainer, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`StudyAI_${selectedNote.title.replace(/\s+/g, '_')}.pdf`);
      toast.success("Branded PDF Downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Export failed.", { id: toastId });
    } finally {
      document.body.removeChild(exportContainer);
    }
  };

  if (authLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0a0a0f] text-slate-200">
      {/* LEFT SIDEBAR: Notes List */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-white/5 flex flex-col bg-[#0f0f1a] relative z-20 ${selectedNote && isMobileView ? 'hidden' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Smart Notes</h1>
            <div className="flex gap-2">
              <Link
                href="/lens"
                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all border border-indigo-500/20"
                title="AI Study Lens"
              >
                <ScanSearch size={20} />
              </Link>
              <button 
                onClick={() => setShowCreator(true)}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-600" /></div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20 px-6 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                    <FileText size={32} />
                </div>
                <p className="text-slate-500 text-sm font-medium">No notes yet. Start by creating one or using Study Lens!</p>
                <Link 
                    href="/lens"
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                >
                    <ScanSearch size={14} /> Try Study Lens
                </Link>
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedNote?.id === note.id 
                    ? "bg-indigo-600/10 border-indigo-500/50 shadow-md" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                    <FileText className={`shrink-0 mt-1 ${selectedNote?.id === note.id ? "text-indigo-400" : "text-slate-500"}`} size={18} />
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${selectedNote?.id === note.id ? "text-white" : "text-slate-300"}`}>
                            {note.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <button 
                        onClick={(e) => handleDelete(note.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Note Viewer */}
      <div className={`flex-1 flex flex-col relative bg-[#0a0a0f] overflow-hidden ${!selectedNote && isMobileView ? 'hidden' : 'flex'}`}>
        {selectedNote ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-4">
                 {isMobileView && (
                    <button 
                      onClick={() => setSelectedNote(null)}
                      className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg"
                    >
                      <ArrowLeft size={18} />
                    </button>
                 )}
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <BookOpen size={20} />
                    </div>
                    <h2 className="text-base md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-md">{selectedNote.title}</h2>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border border-white/5"
                >
                  <Download size={16} /> <span className="hidden md:inline">Export PDF</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-black/5">
               <div id="note-content" className="max-w-5xl mx-auto bg-white/5 p-6 md:p-10 lg:p-16 rounded-[40px] border border-white/5 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <Sparkles size={80} className="text-indigo-500" />
                  </div>
                  <div id="note-content-raw" className="prose prose-invert max-w-none prose-h1:text-4xl prose-h1:font-black prose-h2:text-2xl prose-h2:font-bold prose-h2:text-indigo-400 prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white prose-code:bg-slate-800 prose-code:p-1 prose-code:rounded prose-blockquote:border-indigo-500 overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedNote.content}
                    </ReactMarkdown>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a16]">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-700">
               <FileText size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Select a Note</h3>
            <p className="text-slate-500 max-w-sm">Choose from your library or create a new Smart Note to start studying.</p>
          </div>
        )}

        {/* Note Creator Overlay */}
        <AnimatePresence>
          {showCreator && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl overflow-y-auto pt-10 pb-20 px-4 md:px-10 flex justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#11111a] border border-white/10 rounded-[40px] p-6 md:p-10 shadow-3xl relative h-fit mb-10"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Sparkles size={120} />
                </div>
                
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-white">Create Smart Note</h2>
                    <button onClick={() => setShowCreator(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                   {[
                     { id: "TEACHER", label: "Expert Teacher", icon: BookOpen, desc: "10-point Ultra-Smart notes", color: "text-blue-400" },
                     { id: "REVISION", label: "Speed Revision", icon: Zap, desc: "8-10 points for 1-min read", color: "text-amber-400" },
                     { id: "EXAM", label: "Exam Ready", icon: Award, desc: "10-mark structured answers", color: "text-emerald-400" },
                     { id: "CLEANER", label: "OCR Cleaner", icon: RefreshCw, desc: "Fix messy PDF/Scan text", color: "text-purple-400" },
                     { id: "COMPARE", label: "Compare AI", icon: BarChart3, desc: "Automatic comparison tables", color: "text-rose-400" },
                   ].map((mode) => (
                     <button 
                        key={mode.id}
                        onClick={() => setCreatorMode(mode.id as NoteMode)}
                        className={`relative z-10 flex flex-col items-center gap-3 p-4 w-[130px] md:w-[160px] rounded-[2rem] border transition-all text-center ${
                           creatorMode === mode.id 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-xl scale-105" 
                            : "bg-black/20 border-white/5 text-slate-500 hover:border-white/10 hover:text-white"
                        }`}
                     >
                        <mode.icon size={24} className={creatorMode === mode.id ? "text-white" : mode.color} />
                        <div className="space-y-1">
                           <div className="text-[10px] font-black uppercase tracking-widest">{mode.label}</div>
                           {creatorMode === mode.id && <div className="text-[8px] opacity-70 font-medium leading-tight">{mode.desc}</div>}
                        </div>
                     </button>
                   ))}
                </div>

                <div className="space-y-6">
                    {/* Source Selection Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                        {[
                            { id: "TOPIC", label: "AI Search", icon: Search },
                            { id: "URL", label: "Paste Link", icon: Plus },
                            { id: "TEXT", label: "Paste Text", icon: FileText },
                        ].map((src) => (
                            <button
                                key={src.id}
                                onClick={() => setSourceType(src.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    sourceType === src.id 
                                    ? "bg-indigo-600 text-white shadow-lg" 
                                    : "text-slate-500 hover:text-white"
                                }`}
                            >
                                <src.icon size={14} /> {src.label}
                            </button>
                        ))}
                    </div>

                    {sourceType === "TOPIC" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Topic or Subject</label>
                                <input 
                                    type="text" 
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                    placeholder="e.g. Quantum Physics or World War II" 
                                />
                            </div>

                            {creatorMode === "EXAM" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Specific Question (Optional)</label>
                                        <input 
                                            type="text" 
                                            value={examQuestion}
                                            onChange={(e) => setExamQuestion(e.target.value)}
                                            placeholder="Paste exact question here..." 
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Marks Weighting</label>
                                        <input 
                                            type="text" 
                                            value={examMarks}
                                            onChange={(e) => setExamMarks(e.target.value)}
                                            placeholder="e.g. 5, 10, 15" 
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                <p className="text-[10px] text-indigo-300 font-medium leading-relaxed">
                                    Our AI will perform a deep dive using its internal knowledge library. Perfect for learning new subjects from scratch without any source text.
                                </p>
                            </div>
                        </div>
                    ) : sourceType === "URL" ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Topic / Title</label>
                                    <input 
                                        type="text" 
                                        value={topicInput}
                                        onChange={(e) => setTopicInput(e.target.value)}
                                        placeholder="Note title..." 
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Web Link</label>
                                    <input 
                                        type="url" 
                                        value={rawContent}
                                        onChange={(e) => setRawContent(e.target.value)}
                                        placeholder="https://..." 
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {creatorMode === "EXAM" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Specific Question (Optional)</label>
                                        <input 
                                            type="text" 
                                            value={examQuestion}
                                            onChange={(e) => setExamQuestion(e.target.value)}
                                            placeholder="Paste exact question here..." 
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Marks Weighting</label>
                                        <input 
                                            type="text" 
                                            value={examMarks}
                                            onChange={(e) => setExamMarks(e.target.value)}
                                            placeholder="e.g. 5, 10, 15" 
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <p className="text-[10px] text-blue-300 font-medium leading-relaxed">
                                    Paste a link to any website. We'll extract the core knowledge and transform it into Smart Notes.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Topic / Title</label>
                                <input 
                                    type="text" 
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                    placeholder="e.g. History of Rome" 
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium mb-4"
                                />
                                
                                {creatorMode === "EXAM" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Specific Question (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={examQuestion}
                                                onChange={(e) => setExamQuestion(e.target.value)}
                                                placeholder="Paste exact question here..." 
                                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Marks Weighting</label>
                                            <input 
                                                type="text" 
                                                value={examMarks}
                                                onChange={(e) => setExamMarks(e.target.value)}
                                                placeholder="e.g. 5, 10, 15" 
                                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Source Content (Paste Here)</label>
                                <textarea 
                                    value={rawContent}
                                    onChange={(e) => setRawContent(e.target.value)}
                                    placeholder="Paste text from a lecture, a book, or messy OCR/PDF scans..." 
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Reference Attachment (Optional PDF/Image)</label>
                        <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setSelectedFile(file);
                                    toast.success(`Selected Reference: ${file.name}`);
                                }
                            }}
                            className="hidden" 
                            id="ref-upload"
                            ref={fileInputRef}
                        />
                        <label 
                            htmlFor="ref-upload"
                            className="w-full h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all text-slate-500 group"
                        >
                            {selectedFile ? (
                                <span className="text-white text-xs font-bold">{selectedFile.name}</span>
                            ) : (
                                <>
                                    <Plus size={20} className="group-hover:scale-110 transition-transform mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Attach Material</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-10">
                    <button 
                        onClick={() => setShowCreator(false)}
                        className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold rounded-2xl transition-all border border-white/5"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={isGenerating}
                        onClick={handleCreateNote}
                        className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />}
                        {isGenerating ? "AI Processing..." : ["TEACHER", "REVISION", "EXAM"].includes(creatorMode) ? "Generate Master Note" : "Refine and Format"}
                    </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
