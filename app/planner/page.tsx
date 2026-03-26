export default function PlannerPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Syllabus Planner
      </h1>
      <div className="p-12 bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Upload Your Syllabus</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">Drop your PDF or paste your subjects here, and the AI will instantly break it down into a day-by-day master plan.</p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/25 hover:-translate-y-1 transition-all">
              Add New Subject
          </button>
      </div>
    </div>
  );
}
