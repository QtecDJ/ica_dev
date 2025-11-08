"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-1 px-2 lg:px-2.5 py-1.5 lg:py-2 bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 text-white text-[10px] lg:text-xs font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
    >
      <LogOut className="w-3 h-3 lg:w-3.5 lg:h-3.5 group-hover:rotate-12 transition-transform duration-300" />
      <span className="hidden lg:inline">Logout</span>
    </button>
  );
}
