"use client"

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

export const LayoutShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="h-full bg-slate-50 dark:bg-slate-950">{children}</main>;
  }

  const isFullScreenPage = ["/notes", "/lens", "/tutor"].includes(pathname);

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-slate-900 border-r border-slate-800 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <Navbar />
        <div className={cn(
            "flex-1 overflow-auto",
            !isFullScreenPage && "p-8"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};
