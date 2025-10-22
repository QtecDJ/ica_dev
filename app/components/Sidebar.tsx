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
    <aside className="w-64 bg-gray-900 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Infinity Cheer</h1>
        <p className="text-gray-400 text-sm">Allstars</p>
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
