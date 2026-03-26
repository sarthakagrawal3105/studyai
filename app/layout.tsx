import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "react-hot-toast";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyAI - Your AI Tutor",
  description: "Personalized AI-powered study schedules, tests, and active learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <AuthProvider>
            <Toaster position="top-center" reverseOrder={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-slate-900 border-r border-slate-800">
              <Sidebar />
            </div>
            <main className="md:pl-72 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
              <Navbar />
              <div className="flex-1 p-8 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

