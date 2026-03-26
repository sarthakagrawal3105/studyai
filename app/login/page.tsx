"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth, googleProvider } from "@/lib/firebase"
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth"
import toast from "react-hot-toast"
import { Brain, Smartphone, Mail, Globe } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone")
  
  // Email state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  useEffect(() => {
    // Initialize recaptcha when on phone tab
    if (activeTab === "phone" && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, [activeTab])

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      toast.success(`Welcome ${result.user.displayName}!`)
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password)
        toast.success("Account created!")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success("Welcome back!")
      }
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      setOtpSent(true)
      toast.success("OTP Sent!")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await confirmationResult.confirm(otp)
      toast.success("Phone verified successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error("Invalid OTP. Try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <Brain className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Access StudyAI</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">Log in to sync your syllabus and analyze your performance.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-black/40 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab("phone")}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "phone" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
          >
            <Smartphone className="w-4 h-4 mr-2" /> Phone
          </button>
          <button 
             onClick={() => setActiveTab("email")}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "email" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
          >
            <Mail className="w-4 h-4 mr-2" /> Email
          </button>
        </div>

        {activeTab === "phone" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-300">Mobile Number (India / Global)</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div id="recaptcha-container"></div>
                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl px-4 py-3 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                  Send OTP via SMS
                </button>
              </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-300">Enter OTP</label>
                  <input 
                    type="text" 
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-center tracking-widest text-lg"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl px-4 py-3 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                  Verify & Login
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "email" && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-300">Email Address</label>
              <input 
                type="email" 
                placeholder="student@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-300">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl px-4 py-3 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
              {isRegistering ? "Create Account" : "Login with Email"}
            </button>
            <p className="text-center text-sm text-slate-400 mt-4 cursor-pointer hover:text-white" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </p>
          </form>
        )}

        <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4 text-sm text-slate-500 font-semibold">OR</span>
            <div className="flex-1 border-t border-white/10"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="mt-6 w-full bg-white text-black font-bold rounded-xl px-4 py-3 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Globe className="w-5 h-5 mr-3 text-blue-500" /> Continue with Google
        </button>
      </div>
    </div>
  )
}
