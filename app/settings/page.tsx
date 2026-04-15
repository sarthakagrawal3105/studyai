"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { signOut, updateProfile } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { syncUser } from "@/app/actions/user"
import { toast } from "react-hot-toast"
import { 
  User, 
  Mail, 
  Camera, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  Palette,
  Check
} from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "")

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to log out")
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Update Firebase Profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      })

      // Sync with Prisma Database
      await syncUser({
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: displayName
      })

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Local to Settings) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-indigo-500/10 text-indigo-500 rounded-xl font-semibold">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
            <ShieldCheck className="w-5 h-5" />
            <span>Security</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
            <Palette className="w-5 h-5" />
            <span>Appearance</span>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="bg-white dark:bg-[#0B0F19]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white">Profile Details</h2>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center overflow-hidden">
                  {photoURL ? (
                    <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">HI</span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Profile Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="Image URL (e.g., https://...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-sm font-medium text-slate-500">Email Address (Primary)</label>
                <div className="relative cursor-not-allowed">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent outline-none cursor-not-allowed dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? "Updating..." : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Theme Section */}
          <section className="bg-white dark:bg-[#0B0F19]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold dark:text-white mb-6">Appearance</h2>
            <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  {theme === "dark" ? <Moon className="text-indigo-500" /> : <Sun className="text-amber-500" />}
                </div>
                <div>
                  <p className="font-semibold dark:text-white">Dark Mode</p>
                  <p className="text-sm text-slate-500">Adjust the interface style</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  theme === "dark" ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-pink-500 mb-2">Logout Account</h2>
            <p className="text-sm text-pink-500/70 mb-6">
              This will end your current session. You will need to sign back in to access your data.
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all flex items-center space-x-2 shadow-lg shadow-pink-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout Now</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
