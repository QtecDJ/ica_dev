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
  IconShield 
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import UnreadMessagesBadge from "./UnreadMessagesBadge";
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
  const memberId = session?.user?.memberId;
  const [activeIndex, setActiveIndex] = useState(0);

  // Different navigation based on role
  let navItems: NavItem[] = [];

  if (userRole === "member") {
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/messages", label: "Chat", icon: <IconMessageCircle className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/trainings", label: "Training", icon: <IconBarbell className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/profil", label: "Profil", icon: <IconUser className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else if (userRole === "parent") {
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/profil", label: "Kind", icon: <IconUser className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/messages", label: "Chat", icon: <IconMessageCircle className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/trainings", label: "Training", icon: <IconBarbell className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else if (userRole === "admin") {
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/messages", label: "Chat", icon: <IconMessageCircle className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/teams", label: "Teams", icon: <IconTrophy className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/administration", label: "Admin", icon: <IconShield className="w-5 h-5" stroke={2} />, isActive: false },
    ];
  } else {
    // Coach
    navItems = [
      { href: "/", label: "Home", icon: <IconHome className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/messages", label: "Chat", icon: <IconMessageCircle className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/teams", label: "Teams", icon: <IconTrophy className="w-5 h-5" stroke={2} />, isActive: false },
      { href: "/trainings", label: "Training", icon: <IconBarbell className="w-5 h-5" stroke={2} />, isActive: false },
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 safe-area-pb">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
      
      {/* Active indicator background */}
      <div 
        className="absolute top-0 h-1 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out rounded-b-full"
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
                  relative flex-1 flex flex-col items-center justify-center min-h-[68px] px-3 py-3 rounded-2xl
                  transition-all duration-300 ease-out active:scale-95 touch-manipulation
                  ${isActiveItem 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {/* Active background */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-300
                  ${isActiveItem 
                    ? 'bg-red-50 dark:bg-red-900/20 scale-100 shadow-lg shadow-red-500/10' 
                    : 'bg-transparent scale-95'
                  }
                `} />
                
                {/* Icon container with bounce animation */}
                <div className={`
                  relative z-10 p-2.5 rounded-xl transition-all duration-300
                  ${isActiveItem 
                    ? 'transform -translate-y-1 bg-red-100 dark:bg-red-900/30' 
                    : 'transform translate-y-0'
                  }
                `}>
                  {item.icon}
                  
                  {/* Badge für ungelesene Nachrichten */}
                  {item.label === "Chat" && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <UnreadMessagesBadge />
                    </div>
                  )}
                </div>
                
                {/* Label with smooth opacity */}
                <span className={`
                  relative z-10 text-xs font-semibold mt-1.5 transition-all duration-300 text-center leading-tight
                  ${isActiveItem 
                    ? 'opacity-100 transform translate-y-0 scale-105' 
                    : 'opacity-70 transform translate-y-0.5 scale-100'
                  }
                `}>
                  {item.label}
                </span>
                
                {/* Active dot indicator */}
                <div className={`
                  absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
                  transition-all duration-300
                  ${isActiveItem 
                    ? 'bg-red-500 scale-100 opacity-100' 
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