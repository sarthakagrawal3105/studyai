import { Brain, Flame, Target, Trophy } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Overview
        </h1>
        
      </div>
      
      {/* Premium Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Flame size={100} /></div>
          <h3 className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Current Streak</h3>
          <p className="text-4xl font-black text-orange-500">12 Days</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Top 5% of learners!</p>
        </div>

        <div className="p-6 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={100} /></div>
          <h3 className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Test Accuracy</h3>
          <p className="text-4xl font-black text-emerald-500">87%</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">+4% from last week</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] border border-white/20 relative overflow-hidden text-white">
          <h3 className="font-semibold text-white/80 mb-1">Total EXP</h3>
          <p className="text-4xl font-black">2,450</p>
          <p className="text-xs text-white/70 mt-2 font-medium">Level 12 Scholar</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2 p-8 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center"><Brain className="mr-3 text-purple-500" /> AI Study Recommendations</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border dark:border-white/5 flex items-center justify-between hover:border-purple-500/50 transition-colors cursor-pointer">
              <div>
                <h4 className="font-bold text-lg dark:text-white">Review Thermodynamics</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">You scored 65% on the last test. Let's patch those weak points.</p>
              </div>
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">Start</button>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
           <h2 className="text-2xl font-bold mb-6 flex items-center"><Target className="mr-3 text-emerald-500" /> Daily Focus</h2>
           <div className="space-y-4">
               <div className="flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-white/5">
                   <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-slate-700 dark:text-slate-300">Deep Work</span>
                       <span className="font-bold text-emerald-600 dark:text-emerald-400">2h / 4h</span>
                   </div>
                   <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                       <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                   </div>
               </div>
               <p className="text-sm text-slate-500 text-center mt-2 italic">Focus on beating your past self, not others.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
