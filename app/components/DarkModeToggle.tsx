"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-12 sm:h-14 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toggle Button - Große Touch-Targets für Mobil */}
      <button
        onClick={toggleDarkMode}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isDark 
              ? "bg-gray-600 text-yellow-400" 
              : "bg-yellow-100 text-yellow-600"
          }`}>
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm sm:text-base">
              {isDark ? "Dunkler Modus" : "Heller Modus"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isDark ? "Augenschonend bei Nacht" : "Klar und hell"}
            </p>
          </div>
        </div>
        
        {/* Custom Toggle Switch - Größer für Mobil */}
        <div className={`relative w-14 h-8 sm:w-16 sm:h-9 rounded-full transition-colors duration-300 ${
          isDark 
            ? "bg-red-600" 
            : "bg-gray-300"
        }`}>
          <div className={`absolute top-1 left-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-lg transition-transform duration-300 ${
            isDark ? "translate-x-6 sm:translate-x-7" : "translate-x-0"
          }`}>
            {isDark ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 m-auto mt-1 sm:mt-1" />
            ) : (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 m-auto mt-1 sm:mt-1" />
            )}
          </div>
        </div>
      </button>

      {/* Info Text */}
      <p className="text-xs text-gray-500 dark:text-gray-500 px-1">
        💡 Der Modus wird automatisch gespeichert und bei jedem Besuch angewendet
      </p>
    </div>
  );
}
