"use client"

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export const LayoutShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="h-full bg-slate-50 dark:bg-slate-950">{children}</main>;
  }

  return (
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
  );
};
