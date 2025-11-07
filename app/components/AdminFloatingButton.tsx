"use client";

import Link from "next/link";
import { Settings, UserCog, Users, Shield, Database, BarChart3 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AdminFloatingButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const userRole = session?.user?.role;
  const userRoles = (session?.user as any)?.roles || [userRole];

  // Nur für Admins anzeigen (check roles array)
  const isAdmin = userRoles.includes("admin");
  if (!isAdmin) {
    return null;
  }

  const adminActions = [
    { href: "/users", label: "Benutzer", icon: <UserCog className="w-5 h-5" />, color: "bg-blue-500" },
    { href: "/members", label: "Mitglieder", icon: <Users className="w-5 h-5" />, color: "bg-green-500" },
    { href: "/admin/reports", label: "Berichte", icon: <BarChart3 className="w-5 h-5" />, color: "bg-purple-500" },
    { href: "/admin/system", label: "System", icon: <Database className="w-5 h-5" />, color: "bg-orange-500" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(isOpen ? 5 : [10, 50, 10]);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-24 right-4 z-50">
      {/* Floating action buttons */}
      <div className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {adminActions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
              ${action.color} text-white font-medium
              transform transition-all duration-200
              hover:scale-105 active:scale-95
              animate-slide-in-up
            `}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex-shrink-0">
              {action.icon}
            </div>
            <span className="text-sm whitespace-nowrap">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Main admin button */}
      <button
        onClick={toggleMenu}
        className={`
          w-14 h-14 rounded-full shadow-xl flex items-center justify-center
          transform transition-all duration-300 active:scale-95
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700'
          }
        `}
        aria-label={isOpen ? "Admin-Menü schließen" : "Admin-Menü öffnen"}
      >
        {isOpen ? (
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
              <div className="w-4 h-0.5 bg-white rounded-full" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <Shield className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </div>
        )}
      </button>

      {/* Overlay für Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}