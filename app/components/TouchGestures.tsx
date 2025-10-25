"use client";

import { useEffect, useState } from "react";

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
}

export default function SwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  children,
  className = "",
}: SwipeGestureProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // Prioritize horizontal swipes over vertical
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        hapticFeedback();
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        hapticFeedback();
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        hapticFeedback();
        onSwipeUp();
      }
      if (isDownSwipe && onSwipeDown) {
        hapticFeedback();
        onSwipeDown();
      }
    }
  };

  const hapticFeedback = () => {
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div
      className={`${className} touch-manipulation`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}

// Hook for Pull-to-Refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        isAtTop = true;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop) return;

      currentY = e.touches[0].clientY;
      const pullY = currentY - startY;

      if (pullY > 0 && pullY < 150) {
        setPullDistance(pullY);
        // Prevent default scrolling when pulling down
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        hapticFeedback();
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      isAtTop = false;
    };

    const hapticFeedback = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, isRefreshing, pullDistance]);

  return { isRefreshing, pullDistance };
}

// Button component with enhanced touch feedback
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export function TouchButton({
  children,
  onClick,
  className = "",
  variant = 'primary',
  disabled = false,
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (disabled) return;
    setIsPressed(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (!disabled && onClick) {
      onClick();
    }
  };

  const baseClasses = "relative overflow-hidden transition-all duration-150 ease-out touch-manipulation select-none";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
  };

  const pressedScale = isPressed ? "scale-95" : "scale-100";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${pressedScale} ${disabledClasses} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      disabled={disabled}
    >
      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden rounded-inherit">
        <div
          className={`absolute inset-0 bg-white/20 rounded-inherit transform transition-transform duration-300 ${
            isPressed ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </div>
      <span className="relative z-10">{children}</span>
    </button>
  );
}