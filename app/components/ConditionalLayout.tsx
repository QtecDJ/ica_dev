"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import ResponsiveSidebar from "./ResponsiveSidebar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Check if user is on login page
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login");

  // Show sidebar only if user is authenticated and not on login page
  const showSidebar = session && !isLoginPage;

  if (showSidebar) {
    return (
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <ResponsiveSidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 lg:ml-0 pt-16 lg:pt-0 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For login page or unauthenticated users, show content without sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {children}
    </div>
  );
}
