"use client";

import Link from "next/link";
import { Home, Users, Trophy, Calendar, Dumbbell, UserCog, User as UserIcon, Menu, X, Bell, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import MobileBottomNav from "./MobileBottomNav";

export default function ResponsiveSidebar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const memberId = session?.user?.memberId;
  
  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
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
      {/* Mobile Header with floating menu button */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${
              isScrolled 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-red-600/90 hover:bg-red-700/90 backdrop-blur-sm'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu öffnen"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
              <span className="text-white">∞</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-50">ICA</h1>
            </div>
          </div>
          
          <div className="w-11 h-11 flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
      </header>

      {/* Mobile Overlay with smooth backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Enhanced Sidebar with modern design */}
      <aside
        className={`w-80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full
                   fixed lg:static inset-y-0 left-0 z-40 transition-all duration-300 ease-out ${
                     isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                   }`}
      >
        {/* Modern close button */}
        <button
          className="lg:hidden absolute top-4 right-4 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
          onClick={closeMobileMenu}
          aria-label="Menu schließen"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Enhanced Logo section */}
        <div className="p-6 mt-8 lg:mt-0">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200/50 dark:border-red-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              <span className="text-white">∞</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Infinity Cheer
              </h1>
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold tracking-wider">ALLSTARS</p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Navigation */}
        <nav className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                      active
                        ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 text-red-600 dark:text-red-400 font-semibold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full" />
                    )}
                    
                    {/* Icon with enhanced styling */}
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' 
                        : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-700'
                    }`}>
                      {item.iconName === "Home" && <Home className="w-5 h-5" />}
                      {item.iconName === "Users" && <Users className="w-5 h-5" />}
                      {item.iconName === "Trophy" && <Trophy className="w-5 h-5" />}
                      {item.iconName === "Calendar" && <Calendar className="w-5 h-5" />}
                      {item.iconName === "Dumbbell" && <Dumbbell className="w-5 h-5" />}
                      {item.iconName === "UserCog" && <UserCog className="w-5 h-5" />}
                      {item.iconName === "UserIcon" && <UserIcon className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Enhanced User section */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            {session?.user && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-medium">
                      {userRole === "admin"
                        ? "Administrator"
                        : userRole === "coach"
                        ? "Coach"
                        : userRole === "parent"
                        ? "Elternteil"
                        : "Mitglied"}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                      {session.user.name || ""}
                    </p>
                  </div>
                </div>
              </>
            )}
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}
