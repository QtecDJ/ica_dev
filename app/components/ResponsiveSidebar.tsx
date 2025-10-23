"use client";

import Link from "next/link";
import { Home, Users, Trophy, Calendar, Dumbbell, UserCog, User as UserIcon, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function ResponsiveSidebar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
        className={`w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 border-r border-cyan-500/20 flex flex-col h-full shadow-lg shadow-cyan-500/5 
                   fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ${
                     isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                   }`}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
          onClick={closeMobileMenu}
        >
          <X className="w-5 h-5 text-cyan-400" />
        </button>

        <div className="mb-6 mt-12 lg:mt-0">
          <div className="flex items-center gap-3 mb-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 rounded-lg border border-cyan-500/30">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/30">
              ∞
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white">Infinity Cheer</h1>
              <p className="text-cyan-400 text-xs font-semibold tracking-wider">ALLSTARS</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30 group"
                    onClick={closeMobileMenu}
                  >
                    {item.iconName === "Home" && <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {item.iconName === "Users" && <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {item.iconName === "Trophy" && <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {item.iconName === "Calendar" && <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {item.iconName === "Dumbbell" && <Dumbbell className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {item.iconName === "UserCog" && <UserCog className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {item.iconName === "UserIcon" && <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="mt-auto">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-cyan-500/30 backdrop-blur-sm">
            {session?.user && (
              <>
                <p className="text-xs text-cyan-400 mb-1 uppercase tracking-wide">
                  {userRole === "admin"
                    ? "Administrator"
                    : userRole === "coach"
                    ? "Coach"
                    : userRole === "parent"
                    ? "Elternteil"
                    : "Mitglied"}
                </p>
                <p className="text-sm font-semibold text-white truncate mb-3">
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
