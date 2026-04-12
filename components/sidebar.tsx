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
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export const Sidebar = () => {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#0B0F19] text-white border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="px-5 py-6 flex-1 flex flex-col justify-between">
        <div>
          <Link href="/dashboard" className="block mb-10 group/logo relative">
            {/* Soft Cloud Glow (Subtle White) */}
            <div className="absolute inset-0 bg-white/[0.03] blur-[50px] rounded-full scale-125 pointer-events-none" />
            
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

        {user && (
          <div className="px-3 mt-auto border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4 group/user p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">HI</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate text-white">
                    {user.displayName || "Innovator"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email || user.phoneNumber || "Free Plan"}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-xl transition-all"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
