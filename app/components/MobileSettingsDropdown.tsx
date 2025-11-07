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
      {/* User Avatar Button - Mobile Style */}
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
        
        {/* User Avatar with bounce animation */}
        <div className={`
          relative z-10 w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm transition-all duration-300
          ${isOpen 
            ? 'transform -translate-y-0.5 shadow-lg' 
            : 'transform translate-y-0'
          }
        `}>
          {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        
        {/* Label with smooth opacity */}
        <span className={`
          relative z-10 text-xs font-medium mt-1 transition-all duration-300
          ${isOpen 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-70 transform translate-y-0.5'
          }
        `}>
          Profil
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
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
          {/* User Info Header - Clickable to Profile */}
          {session?.user && (
            <Link
              href={session?.user?.role === "member" ? `/members/${session.user.memberId}` : "/profil"}
              onClick={closeDropdown}
              className="block px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 active:from-red-100 active:to-orange-100 dark:active:from-slate-700 dark:active:to-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {session.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {session.user.role === "admin"
                      ? "Administrator"
                      : session.user.role === "manager"
                      ? "Manager"
                      : session.user.role === "coach"
                      ? "Coach"
                      : session.user.role === "parent"
                      ? "Elternteil"
                      : "Mitglied"}
                  </p>
                </div>
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          )}

          {/* Menu Items */}
          <div className="py-1">
            {/* Settings Link - Smaller */}
            <Link
              href="/settings"
              onClick={closeDropdown}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Einstellungen
            </Link>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
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