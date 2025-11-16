"use client";

import Link from "next/link";
import { 
  IconHome, 
  IconUsers, 
  IconTrophy, 
  IconCalendar, 
  IconBarbell, 
  IconUser, 
  IconMail, 
  IconShield,
  IconBriefcase
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import UnreadEmailsBadge from "./UnreadEmailsBadge";
import MobileSettingsDropdown from "./MobileSettingsDropdown";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

export default function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const userRoles = (session?.user as any)?.roles || [userRole];
  const memberId = session?.user?.memberId;
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper functions for role checking
  const hasRole = (role: string) => userRoles.includes(role);
  const hasAnyRole = (roles: string[]) => roles.some(role => userRoles.includes(role));

  // Check if user is ONLY member (no admin/manager/coach roles)
  const isOnlyMember = hasRole("member") && !hasAnyRole(["admin", "manager", "coach"]);
  // Check if user is ONLY parent (no admin/manager/coach roles)
  const isOnlyParent = hasRole("parent") && !hasAnyRole(["admin", "manager", "coach", "member"]);

  // Different navigation based on role
  let navItems: NavItem[] = [];

  if (isOnlyMember) {
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/emails", label: "Post", icon: <IconMail className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/trainings", label: "Training", icon: <IconBarbell className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/profil", label: "Profil", icon: <IconUser className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else if (isOnlyParent) {
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/profil", label: "Kind", icon: <IconUser className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/emails", label: "Post", icon: <IconMail className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/trainings", label: "Training", icon: <IconBarbell className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else if (hasAnyRole(["admin", "manager"])) {
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/emails", label: "Post", icon: <IconMail className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/coach/verwaltung", label: "Tools", icon: <IconBriefcase className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/administration", label: "Admin", icon: <IconShield className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else if (hasRole("coach")) {
    // Coach (only) - without admin/manager access
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/emails", label: "Post", icon: <IconMail className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/coach/verwaltung", label: "Tools", icon: <IconBriefcase className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/teams", label: "Teams", icon: <IconTrophy className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else {
    // Fallback für andere Rollen
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/emails", label: "Post", icon: <IconMail className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/trainings", label: "Training", icon: <IconBarbell className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/profil", label: "Profil", icon: <IconUser className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  }

  // Update active states
  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  navItems = navItems.map(item => ({
    ...item,
    isActive: isActive(item.href)
  }));

  useEffect(() => {
    const activeIdx = navItems.findIndex(item => item.isActive);
    if (activeIdx !== -1) {
      setActiveIndex(activeIdx);
    }
  }, [pathname]);

  const handleNavClick = (index: number) => {
    setActiveIndex(index);
    // Enhanced haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate([5, 25, 5]); // Short-long-short pattern
    }
    
    // Add a subtle animation effect
    const element = document.querySelector(`[data-nav-index="${index}"]`);
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => {
        element.classList.remove('animate-pulse');
      }, 300);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl border-t-2 border-gray-200/60 dark:border-gray-700/60 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* Enhanced background with gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 via-red-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none" />
      
      {/* Modern active indicator with glow */}
      <div 
        className="absolute top-0 h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500 transition-all duration-500 ease-out rounded-b-full shadow-glow-red"
        style={{
          left: `${(activeIndex / (navItems.length + 1)) * 100}%`,
          width: `${100 / (navItems.length + 1)}%`,
        }}
      />

      <div className="flex items-center px-2 py-2">
        {navItems.map((item, index) => {
          const isActiveItem = item.isActive;
          
          const handleClick = () => {
            handleNavClick(index);
          };
          
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={handleClick}
              data-nav-index={index}
              className={`
                  relative flex-1 flex flex-col items-center justify-center min-h-[72px] px-3 py-3.5 rounded-2xl
                  transition-all duration-300 ease-smooth active:scale-95 touch-manipulation
                  ${isActiveItem 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-300'
                  }
                `}
              >
                {/* Enhanced active background with gradient */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-500 ease-smooth
                  ${isActiveItem 
                    ? 'bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 dark:from-red-900/30 dark:via-red-800/20 dark:to-red-900/20 scale-100 shadow-elegant border-2 border-red-200/40 dark:border-red-700/30' 
                    : 'bg-transparent scale-90 border-2 border-transparent'
                  }
                `} />
                
                {/* Icon container with enhanced bounce animation */}
                <div className={`
                  relative z-10 p-3 rounded-2xl transition-all duration-500 ease-smooth
                  ${isActiveItem 
                    ? 'transform -translate-y-1.5 bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/40 scale-110' 
                    : 'transform translate-y-0 bg-gray-100/50 dark:bg-gray-800/50 scale-100'
                  }
                `}>
                  {item.icon}
                  
                  {/* Badge für ungelesene Emails */}
                  {item.label === "Post" && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <UnreadEmailsBadge />
                    </div>
                  )}
                </div>
                
                {/* Enhanced label with smooth transitions */}
                <span className={`
                  relative z-10 text-xs font-bold mt-2 transition-all duration-500 text-center leading-tight
                  ${isActiveItem 
                    ? 'opacity-100 transform translate-y-0 scale-110 text-red-600 dark:text-red-400' 
                    : 'opacity-60 transform translate-y-0.5 scale-95 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {item.label}
                </span>
                
                {/* Enhanced active dot indicator with glow */}
                <div className={`
                  absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full
                  transition-all duration-500
                  ${isActiveItem 
                    ? 'bg-red-500 scale-100 opacity-100 shadow-glow-red' 
                    : 'bg-transparent scale-0 opacity-0'
                  }
                `} />
                
                {/* Ripple effect on tap */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className={`
                    absolute inset-0 bg-red-500/10 rounded-2xl transform scale-0 opacity-0
                    transition-all duration-200 ease-out
                  `} />
                </div>
              </Link>
            );
        })}
        
        {/* Settings Dropdown - Same flex-1 as other items */}
        <div className="flex-1">
          <MobileSettingsDropdown />
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}