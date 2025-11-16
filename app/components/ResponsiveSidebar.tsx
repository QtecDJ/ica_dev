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
  IconSettings,
  IconMail,
  IconBriefcase
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import MobileBottomNav from "./MobileBottomNav";
import AdminFloatingButton from "./AdminFloatingButton";
import UnreadEmailsBadge from "./UnreadEmailsBadge";
import SettingsDropdown from "./SettingsDropdown";

export default function ResponsiveSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const userRoles = (session?.user as any)?.roles || [userRole];
  const memberId = session?.user?.memberId;

  // Helper functions for role checking
  const hasRole = (role: string) => userRoles.includes(role);
  const hasAnyRole = (roles: string[]) => roles.some(role => userRoles.includes(role));

  // Different navigation based on role
  let navItems: Array<{ href: string; label: string; iconName: string }> = [];
  
  // Check if user is ONLY member (no admin/manager/coach roles)
  const isOnlyMember = hasRole("member") && !hasAnyRole(["admin", "manager", "coach"]);
  // Check if user is ONLY parent (no admin/manager/coach roles)
  const isOnlyParent = hasRole("parent") && !hasAnyRole(["admin", "manager", "coach", "member"]);
  
  if (isOnlyMember) {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/profil", label: "Mein Profil", iconName: "UserIcon" },
      { href: "/emails", label: "Postfach", iconName: "Mail" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
    ];
  } else if (isOnlyParent) {
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/profil", label: "Mein Kind", iconName: "UserIcon" },
      { href: "/emails", label: "Postfach", iconName: "Mail" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
    ];
  } else {
    // Admin, Manager, or Coach navigation
    navItems = [
      { href: "/", label: "Dashboard", iconName: "Home" },
      { href: "/teams", label: "Teams", iconName: "Trophy" },
      { href: "/members", label: "Mitglieder", iconName: "Users" },
      { href: "/emails", label: "Postfach", iconName: "Mail" },
      { href: "/events", label: "Events", iconName: "Calendar" },
      { href: "/calendar", label: "Kalender", iconName: "Calendar" },
      { href: "/trainings", label: "Trainings", iconName: "Dumbbell" },
    ];
  }
  
  // Coach Verwaltung für Coaches, Admins und Manager
  if (hasAnyRole(["coach", "admin", "manager"])) {
    navItems.push({ href: "/coach/verwaltung", label: "Coach Tools", iconName: "Briefcase" });
  }
  
  // Admin und Manager haben Zugriff auf Administration (check roles array)
  if (hasAnyRole(["admin", "manager"])) {
    navItems.push({ href: "/administration", label: "Administration", iconName: "Shield" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop-only Sidebar - Responsive width */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 2xl:w-80 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900 text-gray-900 dark:text-gray-50 border-r border-gray-200/60 dark:border-gray-700/60 flex-col h-full backdrop-blur-sm">
        {/* Enhanced Logo section - Responsive */}
        <div className="p-4 lg:p-5 xl:p-6">
          <div className="relative group overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-red-500/5 to-transparent dark:from-red-600/20 dark:via-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            <div className="relative flex items-center gap-3 lg:gap-4 p-3 lg:p-4 xl:p-5 rounded-2xl bg-gradient-to-br from-red-50 via-white to-red-50/50 dark:from-red-900/20 dark:via-gray-800/50 dark:to-red-800/20 border-2 border-red-200/60 dark:border-red-700/40 shadow-elegant group-hover:shadow-elegant-hover transition-all duration-300">
              <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white dark:bg-gray-800 ring-2 ring-red-100 dark:ring-red-900/50 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.png" 
                  alt="Infinity Allstars Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent truncate">
                  Infinity Cheer
                </h1>
                <p className="text-red-600 dark:text-red-400 text-xs lg:text-sm font-bold tracking-widest uppercase">ALLSTARS</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Navigation - Responsive */}
        <nav className="flex-1 overflow-y-auto px-3 lg:px-4 py-2">
          <ul className="space-y-1 lg:space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 lg:space-x-3 xl:space-x-4 px-3 lg:px-4 py-3 lg:py-3.5 xl:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      active
                        ? "bg-gradient-to-br from-red-50 via-red-100/80 to-red-50 dark:from-red-900/30 dark:via-red-800/20 dark:to-red-900/30 text-red-600 dark:text-red-400 font-bold shadow-elegant border-2 border-red-200/60 dark:border-red-700/40"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-800/50 dark:hover:to-gray-800/30 hover:text-gray-900 dark:hover:text-gray-50 border-2 border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/40 hover:shadow-sm"
                    }`}
                  >
                    {/* Active indicator with glow */}
                    {active && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 via-red-600 to-red-500 rounded-r-full shadow-glow-red" />
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-transparent rounded-2xl animate-pulse-subtle" />
                      </>
                    )}
                    
                    {/* Icon with enhanced styling - Responsive */}
                    <div className={`p-1.5 lg:p-2 xl:p-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${
                      active 
                        ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-105' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:scale-105'
                    }`}>
                      {item.iconName === "Home" && <IconHome className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "Users" && <IconUsers className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "Trophy" && <IconTrophy className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "Calendar" && <IconCalendar className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "Dumbbell" && <IconBarbell className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "Shield" && <IconShield className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "UserIcon" && <IconUser className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                      {item.iconName === "Mail" && <IconMail className="w-4 h-4 lg:w-5 lg:h-5" stroke={2.5} />}
                    </div>
                    <span className={`text-xs lg:text-sm font-semibold flex-1 ${active ? 'text-red-600 dark:text-red-400' : ''}`}>{item.label}</span>
                    
                    {/* Badge für ungelesene Emails */}
                    {item.iconName === "Mail" && <UnreadEmailsBadge className="ml-2" />}
                    
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-2xl" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Enhanced User section - Responsive */}
        <div className="p-3 lg:p-4 mt-auto">
          <div className="relative group overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-xl lg:rounded-2xl p-2.5 lg:p-3 border-2 border-gray-200/60 dark:border-gray-700/60 shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {session?.user && (
              <>
                <Link href="/profil" className="flex items-center gap-2 lg:gap-2.5 mb-2 lg:mb-2.5 relative z-10 cursor-pointer hover:opacity-80 transition-opacity">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl object-cover shadow-md ring-2 ring-red-100 dark:ring-red-900/50 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-red-500/30 ring-2 ring-red-100 dark:ring-red-900/50 group-hover:scale-105 transition-transform duration-300">
                      {session.user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-50 truncate leading-tight">
                      {session.user.name || ""}
                    </p>
                    <p className="text-[9px] lg:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium leading-tight">
                      {userRole === "admin"
                        ? "Administrator"
                        : userRole === "manager"
                        ? "Manager"
                        : userRole === "coach"
                        ? "Coach"
                        : userRole === "parent"
                        ? "Elternteil"
                        : "Mitglied"}
                    </p>
                  </div>
                </Link>
              </>
            )}
            <div className="flex gap-1.5 relative z-10">
              <Link 
                href="/settings"
                className="flex items-center justify-center gap-1 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200 font-medium text-[10px] lg:text-xs shadow-sm hover:shadow-md group"
              >
                <IconSettings className="w-3 h-3 lg:w-3.5 lg:h-3.5 group-hover:rotate-90 transition-transform duration-300" stroke={2} />
              </Link>
              <div className="flex-1">
                <LogoutButton />
              </div>
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
