"use client";

import { useEffect, useState } from "react";

interface UnreadMessagesBadgeProps {
  className?: string;
}

export default function UnreadMessagesBadge({ className = "" }: UnreadMessagesBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    fetchUnreadCount();

    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/messages/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span 
      className={`inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse ${className}`}
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
