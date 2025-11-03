"use client";

import Link from "next/link";
import { 
  IconHome, 
  IconUsers, 
  IconTrophy, 
  IconCalendar, 
  IconBarbell, 
  IconUser, 
  IconMessageCircle, 
  IconShield, 
  IconSettings 
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import MobileBottomNav from "./MobileBottomNav";
import AdminFloatingButton from "./AdminFloatingButton";
import UnreadMessagesBadge from "./UnreadMessagesBadge";
import SettingsDropdown from "./SettingsDropdown";

export default function ResponsiveSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const memberId = session?.user?.memberId;

  // Different navigation based on role
  let navItems: Array<{ href: string; label: string; iconName: string }> = [];
  
  if (userRole === "member") {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/profil", label: "Mein Profil", iconName: "UserIcon" },
      { href: "/messages", label: "Nachrichten", iconName: "MessageCircle" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
    ];
  } else if (userRole === "parent") {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/profil", label: "Mein Kind", iconName: "UserIcon" },
      { href: "/messages", label: "Nachrichten", iconName: "MessageCircle" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
    ];
  } else {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/teams", label: "Teams", iconName: "Trophy" },
      { href: "/members", label: "Mitglieder", iconName: "Users" },
      { href: "/messages", label: "Nachrichten", iconName: "MessageCircle" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
    ];
  }
  
  if (userRole === "admin") {
    navItems.push({ href: "/administration", label: "Administration", iconName: "Shield" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop-only Sidebar */}
      <aside className="hidden lg:flex w-80 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 border-r border-gray-200 dark:border-gray-700 flex-col h-full">
        {/* Enhanced Logo section */}
        <div className="p-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200/50 dark:border-red-700/50">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Infinity Allstars Logo" 
                className="w-full h-full object-contain"
              />
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
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-50"
                    }`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full" />
                    )}
                    
                    {/* Icon with enhanced styling */}
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' 
                        : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
                    }`}>
                      {item.iconName === "Home" && <IconHome className="w-5 h-5" stroke={2} />}
                      {item.iconName === "Users" && <IconUsers className="w-5 h-5" stroke={2} />}
                      {item.iconName === "Trophy" && <IconTrophy className="w-5 h-5" stroke={2} />}
                      {item.iconName === "Calendar" && <IconCalendar className="w-5 h-5" stroke={2} />}
                      {item.iconName === "Dumbbell" && <IconBarbell className="w-5 h-5" stroke={2} />}
                      {item.iconName === "Shield" && <IconShield className="w-5 h-5" stroke={2} />}
                      {item.iconName === "UserIcon" && <IconUser className="w-5 h-5" stroke={2} />}
                      {item.iconName === "MessageCircle" && <IconMessageCircle className="w-5 h-5" stroke={2} />}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    
                    {/* Badge für ungelesene Nachrichten */}
                    {item.iconName === "MessageCircle" && <UnreadMessagesBadge className="ml-2" />}
                    
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            {session?.user && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                      {userRole === "admin"
                        ? "Administrator"
                        : userRole === "coach"
                        ? "Coach"
                        : userRole === "parent"
                        ? "Elternteil"
                        : "Mitglied"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">
                      {session.user.name || ""}
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <LogoutButton />
              </div>
              <SettingsDropdown />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Admin Floating Button */}
      <AdminFloatingButton />
    </>
  );
}
