"use client";

import { motion } from "framer-motion";

interface ProgressChartProps {
  data?: number[];
  labels?: string[];
}

export default function ProgressChart({ 
  data = [40, 45, 42, 58, 65, 60, 85], 
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
}: ProgressChartProps) {
  
  // Ensure we have 7 points for the UI if fewer tests exist
  const displayData = [...data].reverse().slice(0, 7);
  const displayLabels = [...labels].reverse().slice(0, 7);

  // Fallback if no data
  if (displayData.length === 0) {
      return (
          <div className="h-full w-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-slate-600 text-[10px] font-bold uppercase">
              No Test Data Yet
          </div>
      )
  }

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <div className="flex-1 flex items-end gap-2 px-2">
        {displayData.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group gap-2">
            <div className="relative w-full flex justify-center">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none z-50">
                {value}%
              </div>
              
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`w-full max-w-[12px] sm:max-w-[20px] rounded-full ${
                  i === displayData.length - 1 
                    ? "bg-gradient-to-t from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(129,140,248,0.4)]" 
                    : "bg-indigo-500/20 group-hover:bg-indigo-500/40"
                } transition-all duration-300`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between px-2 mt-4">
        {displayLabels.map((label, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {label || `T${i+1}`}
          </span>
        ))}
      </div>
    </div>
  );
}
