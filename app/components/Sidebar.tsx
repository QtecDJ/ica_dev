"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Trophy, Calendar, Dumbbell } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/teams", label: "Teams", icon: Trophy },
  { href: "/members", label: "Mitglieder", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/trainings", label: "Trainings", icon: Dumbbell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-black via-gray-900 to-black text-white p-6 border-r-4 border-red-600">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center font-bold text-2xl">
            ∞
          </div>
          <div>
            <h1 className="text-xl font-bold">Infinity Cheer</h1>
            <p className="text-red-400 text-xs font-semibold tracking-wider">ALLSTARS</p>
          </div>
        </div>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-red-700">
          <p className="text-xs text-gray-400 mb-1">Admin</p>
          <p className="text-sm font-semibold">Backoffice System</p>
        </div>
      </div>
    </aside>
  );
}
