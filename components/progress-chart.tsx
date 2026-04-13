"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ProgressChartProps {
  data?: number[];
  labels?: string[];
}

export default function ProgressChart({ 
  data = [45, 52, 48, 70, 62, 85, 92], 
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
}: ProgressChartProps) {
  
  const width = 400;
  const height = 150;
  const padding = 20;

  // Generate SVG Path for a smooth curve
  const points = useMemo(() => {
    return data.map((value, i) => ({
      x: (i * (width - padding * 2)) / (data.length - 1) + padding,
      y: height - (value / 100) * (height - padding * 2) - padding,
      val: value
    }));
  }, [data]);

  const linePath = useMemo(() => {
    if (points.length < 2) return "";
    
    // Create a smooth cubic bezier path
    return points.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      
      const prev = arr[i - 1];
      const cp1x = prev.x + (point.x - prev.x) / 2;
      const cp2x = cp1x;
      
      return `${acc} C ${cp1x},${prev.y} ${cp2x},${point.y} ${point.x},${point.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    return `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;
  }, [linePath, points]);

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-slate-600 text-[10px] font-bold uppercase">
          No Test Data Yet
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative group">
      {/* Chart Overlay Info */}
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <div className="flex flex-col items-end">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Peak Performance</div>
            <div className="text-xl font-black text-white">{Math.max(...data)}%</div>
        </div>
      </div>

      <div className="flex-1 relative mt-8">
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
          </defs>

          {/* Area under the line */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Main Line with Glow */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Data Points */}
          {points.map((point, i) => (
            <g key={i} className="group/dot">
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="4"
                className="fill-indigo-500 stroke-[#0B0F19] stroke-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="10"
                className="fill-indigo-500/20 opacity-0 group-hover/dot:opacity-100 transition-opacity cursor-pointer"
              />
            </g>
          ))}
        </svg>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between w-full mt-4 px-1">
        {labels.map((label, i) => (
          <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {label}
          </span>
        ))}
      </div>

      {/* Background Grid Lines (Subtle) */}
      <div className="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-between pointer-events-none -z-10 opacity-20">
         <div className="border-t border-white/5 w-full"></div>
         <div className="border-t border-white/5 w-full"></div>
         <div className="border-t border-white/5 w-full"></div>
      </div>
    </div>
  );
}
