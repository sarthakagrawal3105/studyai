"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import ForceGraph3D to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface GraphData {
  nodes: any[];
  links: any[];
}

export default function KnowledgeUniverse({ data }: { data: GraphData }) {
  const fgRef = useRef<any>();

  const processedData = useMemo(() => {
    return {
      nodes: data.nodes.map(n => ({ ...n })),
      links: data.links.map(l => ({ ...l }))
    };
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    // Aim at node from outside it
    const distance = 80;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
        fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new pos
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
        );
    }
  }, []);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-[#0a0a16] border border-white/5 relative group">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
            Knowledge Universe <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-widest text-white/80">Interactive</span>
        </h3>
        <p className="text-sm text-slate-400">Click planetary nodes to dive deeper</p>
      </div>

      <div className="absolute inset-0 z-0">
        <ForceGraph3D
          ref={fgRef}
          graphData={processedData}
          backgroundColor="#0a0a16"
          showNavInfo={false}
          nodeLabel={(node: any) => `
            <div class="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl">
              <div class="text-white font-bold text-base mb-1">${node.name}</div>
              <div class="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">${node.type}</div>
              ${node.isCompleted !== undefined ? `
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full ${node.isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}"></div>
                    <span class="text-xs ${node.isCompleted ? 'text-emerald-400' : 'text-slate-500'}">
                        ${node.isCompleted ? 'Mastered' : 'Pending'}
                    </span>
                </div>
              ` : ''}
            </div>
          `}
          nodeVal={(node: any) => node.val}
          nodeColor={(node: any) => {
              if (node.type === 'sun') return '#FBBF24';
              if (node.type === 'planet') return node.color || '#8B5CF6';
              if (node.type === 'star') return node.isCompleted ? '#10B981' : '#334155';
              return '#475569';
          }}
          linkColor={() => 'rgba(255,255,255,0.05)'}
          linkWidth={1.5}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={2}
          onNodeClick={handleNodeClick}
          enableNodeDrag={false}
          enablePointerInteraction={true}
        />
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-2 text-xs font-bold text-white/50 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Subject Planets
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-white/50 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed Topic
        </div>
      </div>
    </div>
  );
}
