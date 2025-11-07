"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, User, LogOut, ChevronUp } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function SettingsDropdown() {
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
    <div className="relative" ref={dropdownRef}>
      {/* User Name Button - Click to open profile */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          isOpen
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50'
        }`}
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
          {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {/* User Name */}
        <span className="hidden lg:inline font-medium">
          {session?.user?.name || 'User'}
        </span>
        <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-0' : 'rotate-180'
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
          {/* User Info Header - Clickable to Profile */}
          {session?.user && (
            <Link
              href={session?.user?.role === "member" ? `/members/${session.user.memberId}` : "/profil"}
              onClick={closeDropdown}
              className="block px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 hover:from-red-100 hover:to-orange-100 dark:hover:from-slate-700 dark:hover:to-slate-700 transition-colors"
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
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Einstellungen
            </Link>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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