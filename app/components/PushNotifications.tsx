"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Register service worker and check for existing subscription
      navigator.serviceWorker.register('/push-sw.js')
        .then(registration => {
          return registration.pushManager.getSubscription();
        })
        .then(sub => {
          setSubscription(sub);
        })
        .catch(err => console.log('Service Worker registration failed:', err));
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
        });
        
        setSubscription(sub);
        
        // Send subscription to server
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sub),
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Remove subscription from server
      await fetch('/api/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {permission === 'granted' && subscription ? (
        <button
          onClick={unsubscribe}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
        >
          <Bell className="w-4 h-4" />
          Benachrichtigungen aktiv
        </button>
      ) : (
        <button
          onClick={requestPermission}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <BellOff className="w-4 h-4" />
          Benachrichtigungen aktivieren
        </button>
      )}
    </div>
  );
}