"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, User, LogOut, ChevronUp } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function MobileSettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Settings Button - Mobile Style */}
      <button
        onClick={toggleDropdown}
        className={`w-full flex flex-col items-center justify-center min-h-[60px] px-2 py-2 rounded-xl transition-all duration-300 ease-out active:scale-95 touch-manipulation ${
          isOpen
            ? 'text-red-600 dark:text-red-400'
            : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        {/* Active background */}
        <div className={`
          absolute inset-0 rounded-xl transition-all duration-300
          ${isOpen 
            ? 'bg-red-50 dark:bg-red-900/20 scale-100' 
            : 'bg-transparent scale-95'
          }
        `} />
        
        {/* Icon container with bounce animation */}
        <div className={`
          relative z-10 p-2 rounded-lg transition-all duration-300
          ${isOpen 
            ? 'transform -translate-y-0.5 bg-red-100 dark:bg-red-900/30' 
            : 'transform translate-y-0'
          }
        `}>
          <Settings className="w-5 h-5" />
        </div>
        
        {/* Label with smooth opacity */}
        <span className={`
          relative z-10 text-xs font-medium mt-1 transition-all duration-300
          ${isOpen 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-70 transform translate-y-0.5'
          }
        `}>
          Settings
        </span>
        
        {/* Active dot indicator */}
        <div className={`
          absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full
          transition-all duration-300
          ${isOpen 
            ? 'bg-red-500 scale-100 opacity-100' 
            : 'bg-transparent scale-0 opacity-0'
          }
        `} />
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50">
          {/* User Info */}
          {session?.user && (
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {session.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {session.user.role === "admin"
                      ? "Administrator"
                      : session.user.role === "coach"
                      ? "Coach"
                      : session.user.role === "parent"
                      ? "Elternteil"
                      : "Mitglied"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile Link */}
            <Link
              href={session?.user?.role === "member" ? `/members/${session.user.memberId}` : "/profil"}
              onClick={closeDropdown}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <User className="w-4 h-4" />
              Profil anzeigen
            </Link>

            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={closeDropdown}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Einstellungen
            </Link>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}