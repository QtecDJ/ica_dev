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
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <ResponsiveSidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 lg:ml-0">
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <div id="main-content" className="container-page">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For login page or unauthenticated users, show content without sidebar
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {children}
    </div>
  );
}
