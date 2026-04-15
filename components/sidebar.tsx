"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Camera, Settings, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "text-sky-400 font-semibold" },
  { label: "Syllabus Planner", icon: Calendar, href: "/planner", color: "text-violet-400 font-semibold" },
  { label: "My Plans", icon: BookOpen, href: "/plans", color: "text-fuchsia-400 font-semibold" },
  { label: "AI Tests", icon: CheckSquare, href: "/tests", color: "text-pink-400 font-semibold" },
  { label: "Smart Notes", icon: BookOpen, href: "/notes", color: "text-orange-400 font-semibold" },
  { label: "AI Study Lens", icon: Camera, href: "/lens", color: "text-emerald-400 font-semibold" },
  { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-400" },
]

import { useAuth } from "@/components/auth-provider"
export const Sidebar = () => {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="px-5 py-6 flex-1 flex flex-col justify-between">
        <div>
          <Link href="/dashboard" className="block mb-10 group/logo relative">
            {/* Soft Cloud Glow (Subtle White) */}
            <div className="absolute inset-0 bg-indigo-500/[0.03] dark:bg-white/[0.03] blur-[50px] rounded-full scale-125 pointer-events-none" />
            
            {/* Ambient Indigo Glow (Subtle) */}
            <div className="absolute inset-0 bg-indigo-500/[0.05] blur-[40px] rounded-full scale-110 group-hover/logo:bg-indigo-500/10 transition-all duration-1000" />
            
            <div className="relative h-24 w-full flex items-center justify-center transition-transform duration-500 group-hover/logo:scale-105">
              <img 
                src="/logo.png" 
                alt="StudyAI Logo" 
                className="max-w-full max-h-full object-contain rounded-2xl opacity-90 transition-opacity group-hover/logo:opacity-100" 
                style={{
                  maskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 100%)'
                }}
              />
            </div>
          </Link>
          <div className="space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-300",
                  pathname === route.href 
                    ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-indigo-500/20 dark:ring-white/10" 
                    : "text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/5"
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

        {user && (
          <div className="px-3 mt-auto border-t border-slate-200 dark:border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4 group/user p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-slate-800 dark:text-white">HI</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                    {user.displayName || "Innovator"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email || user.phoneNumber || "Free Plan"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
