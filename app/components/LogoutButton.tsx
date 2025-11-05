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
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-elegant hover:shadow-elegant-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
    >
      <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
      Abmelden
    </button>
  );
}
