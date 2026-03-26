"use client"

import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export const Navbar = () => {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white/50 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-all">
      <div className="text-xl font-bold tracking-tight hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
        Welcome back, Innovator 🚀
      </div>
      <div className="flex w-full justify-end items-center gap-x-6">
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-x-4">
            <span className="text-sm font-medium text-slate-300 hidden sm:block">
              {user.phoneNumber || user.email || "Student"}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-pink-500 hover:text-pink-400 font-bold"
            >
              Logout
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] cursor-pointer hover:scale-110 transition-transform">
                <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-white">HI</span>
                    )}
                </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  )
}
