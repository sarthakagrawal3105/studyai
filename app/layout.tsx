import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { LayoutShell } from "@/components/layout-shell";
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
          <LayoutShell>
            {children}
          </LayoutShell>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

