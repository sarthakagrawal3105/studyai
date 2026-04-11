"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import toast from "react-hot-toast"
import { Brain, Globe, Sparkles } from "lucide-react"
import { syncUser } from "@/app/actions/user"

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      // Persist user to our local Prisma database
      await syncUser({
        email: result.user.email,
        name: result.user.displayName,
        phoneNumber: result.user.phoneNumber
      })

      toast.success(`Welcome ${result.user.displayName}!`)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error("Failed to sign in. Please check your connection.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(168,85,247,0.4)] ring-1 ring-white/20">
            <Brain className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">StudyAI</h1>
          <p className="text-slate-400 max-w-[280px]">Your personal AI tutor for smarter learning and better results.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center mb-8">
            <div className="flex items-center justify-center gap-x-2 text-indigo-400 font-bold text-sm mb-2 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Secure Access
            </div>
            <p className="text-xs text-slate-500">Sign in with Google to sync your progress across devices.</p>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full h-14 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-x-4 hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl group"
          >
            <Globe className="w-6 h-6 text-blue-500 group-hover:rotate-12 transition-transform" /> 
            Continue with Google
          </button>

          <p className="text-[10px] text-center text-slate-600 px-6 uppercase tracking-tighter leading-relaxed">
            By continuing, you agree to StudyAI's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
