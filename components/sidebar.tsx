"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, MessageSquare, Settings, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "text-sky-400 font-semibold" },
  { label: "Syllabus Planner", icon: Calendar, href: "/planner", color: "text-violet-400 font-semibold" },
  { label: "My Plans", icon: BookOpen, href: "/plans", color: "text-fuchsia-400 font-semibold" },
  { label: "AI Tests", icon: CheckSquare, href: "/tests", color: "text-pink-400 font-semibold" },
  { label: "Smart Notes", icon: BookOpen, href: "/notes", color: "text-orange-400 font-semibold" },
  { label: "AI Study Tutor", icon: MessageSquare, href: "/tutor", color: "text-emerald-400 font-semibold" },
  { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-400" },
]

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#0B0F19] text-white border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="px-5 py-6 flex-1">
        <Link href="/dashboard" className="flex items-center pl-2 mb-14 drop-shadow-md hover:scale-105 transition-transform duration-300">
          <div className="relative w-10 h-10 mr-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center">
                <span className="font-extrabold text-white text-xl">S</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            StudyAI
          </h1>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-300",
                pathname === route.href 
                  ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                <span className="group-hover:translate-x-1 transition-transform duration-300">{route.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
