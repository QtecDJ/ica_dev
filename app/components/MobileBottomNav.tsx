"use client";

import Link from "next/link";
import { Home, Users, Trophy, Calendar, Dumbbell, UserCog, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
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
      { href: "/", label: "Home", icon: <Home className="w-5 h-5" />, isActive: false },
      { href: `/members/${memberId}`, label: "Profil", icon: <UserIcon className="w-5 h-5" />, isActive: false },
    ];
  } else if (userRole === "parent") {
    navItems = [
      { href: "/", label: "Home", icon: <Home className="w-5 h-5" />, isActive: false },
      { href: "/meine-kinder", label: "Kinder", icon: <Users className="w-5 h-5" />, isActive: false },
      { href: "/events", label: "Events", icon: <Calendar className="w-5 h-5" />, isActive: false },
      { href: "/calendar", label: "Kalender", icon: <Calendar className="w-5 h-5" />, isActive: false },
      { href: "/trainings", label: "Training", icon: <Dumbbell className="w-5 h-5" />, isActive: false },
    ];
  } else {
    navItems = [
      { href: "/", label: "Home", icon: <Home className="w-5 h-5" />, isActive: false },
      { href: "/teams", label: "Teams", icon: <Trophy className="w-5 h-5" />, isActive: false },
      { href: "/members", label: "Mitglieder", icon: <Users className="w-5 h-5" />, isActive: false },
      { href: "/events", label: "Events", icon: <Calendar className="w-5 h-5" />, isActive: false },
      { href: "/trainings", label: "Training", icon: <Dumbbell className="w-5 h-5" />, isActive: false },
    ];
  }

  // Admin-Funktionen werden über die floating Admin-Schaltfläche bereitgestellt

  // Update active states
  const isActive = (href: string) => {
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-700/50 safe-area-pb">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
      
      {/* Active indicator background */}
      <div 
        className="absolute top-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out"
        style={{
          left: `${(activeIndex / navItems.length) * 100}%`,
          width: `${100 / navItems.length}%`,
        }}
      />

      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const isActiveItem = item.isActive;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(index)}
              data-nav-index={index}
              className={`
                relative flex flex-col items-center justify-center min-h-[60px] px-3 py-2 rounded-xl
                transition-all duration-300 ease-out active:scale-95 touch-manipulation
                ${isActiveItem 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }
              `}
              style={{
                width: `${100 / navItems.length}%`,
              }}
            >
              {/* Active background */}
              <div className={`
                absolute inset-0 rounded-xl transition-all duration-300
                ${isActiveItem 
                  ? 'bg-red-50 dark:bg-red-900/20 scale-100' 
                  : 'bg-transparent scale-95'
                }
              `} />
              
              {/* Icon container with bounce animation */}
              <div className={`
                relative z-10 p-2 rounded-lg transition-all duration-300
                ${isActiveItem 
                  ? 'transform -translate-y-0.5 bg-red-100 dark:bg-red-900/30' 
                  : 'transform translate-y-0'
                }
              `}>
                {item.icon}
              </div>
              
              {/* Label with smooth opacity */}
              <span className={`
                relative z-10 text-xs font-medium mt-1 transition-all duration-300
                ${isActiveItem 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-70 transform translate-y-0.5'
                }
              `}>
                {item.label}
              </span>
              
              {/* Active dot indicator */}
              <div className={`
                absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full
                transition-all duration-300
                ${isActiveItem 
                  ? 'bg-red-500 scale-100 opacity-100' 
                  : 'bg-transparent scale-0 opacity-0'
                }
              `} />
              
              {/* Ripple effect on tap */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className={`
                  absolute inset-0 bg-red-500/10 rounded-xl transform scale-0 opacity-0
                  transition-all duration-200 ease-out
                  ${isActiveItem ? 'animate-ping' : ''}
                `} />
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}