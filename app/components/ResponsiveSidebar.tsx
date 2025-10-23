"use client";

import Link from "next/link";
import { Home, Users, Trophy, Calendar, Dumbbell, UserCog, User as UserIcon, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function ResponsiveSidebar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const memberId = session?.user?.memberId;
  
  // Different navigation based on role
  let navItems: Array<{ href: string; label: string; iconName: string }> = [];
  
  if (userRole === "member") {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: `/members/${memberId}`, label: "Mein Profil", iconName: "UserIcon" },
    ];
  } else if (userRole === "parent") {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/members", label: "Meine Kinder", iconName: "Users" },
    ];
  } else {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/teams", label: "Teams", iconName: "Trophy" },
      { href: "/members", label: "Mitglieder", iconName: "Users" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
    ];
  }
  
  if (userRole === "admin") {
    navItems.push({ href: "/users", label: "Benutzerverwaltung", iconName: "UserCog" });
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menu öffnen"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 p-4 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full
                   fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ${
                     isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                   }`}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          onClick={closeMobileMenu}
          aria-label="Menu schließen"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Logo */}
        <div className="mb-6 mt-12 lg:mt-0">
          <div className="flex items-center gap-3 mb-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
              <span className="text-white">∞</span>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold">Infinity Cheer</h1>
              <p className="text-red-600 dark:text-red-400 text-xs font-semibold tracking-wider">ALLSTARS</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                      active
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.iconName === "Home" && <Home className="w-5 h-5" />}
                    {item.iconName === "Users" && <Users className="w-5 h-5" />}
                    {item.iconName === "Trophy" && <Trophy className="w-5 h-5" />}
                    {item.iconName === "Calendar" && <Calendar className="w-5 h-5" />}
                    {item.iconName === "Dumbbell" && <Dumbbell className="w-5 h-5" />}
                    {item.iconName === "UserCog" && <UserCog className="w-5 h-5" />}
                    {item.iconName === "UserIcon" && <UserIcon className="w-5 h-5" />}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Info & Logout */}
        <div className="mt-auto">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            {session?.user && (
              <>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide font-medium">
                  {userRole === "admin"
                    ? "Administrator"
                    : userRole === "coach"
                    ? "Coach"
                    : userRole === "parent"
                    ? "Elternteil"
                    : "Mitglied"}
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate mb-3">
                  {session.user.name || ""}
                </p>
              </>
            )}
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
