"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, MessageSquare, Dumbbell, Check, X } from "lucide-react";

export default function SettingsForm() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
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
  }, []);

  const enableNotifications = async () => {
    if (!isSupported) return;
    setIsLoading(true);
    setMessage("");

    try {
      // Check if VAPID key is available
      // Support both new naming and old naming for backward compatibility
      const vapidKey = process.env.NEXT_PUBLIC_Public_Key || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error('VAPID key not configured');
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
        
        setSubscription(sub);
        
        // Send subscription to server
        const response = await fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sub),
        });

        if (response.ok) {
          setMessage("✅ Push-Benachrichtigungen erfolgreich aktiviert!");
        } else {
          const errorData = await response.text();
          throw new Error(`Server error: ${errorData}`);
        }
      } else {
        setMessage("❌ Berechtigung für Benachrichtigungen wurde verweigert");
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setMessage(`❌ Fehler beim Aktivieren der Benachrichtigungen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    if (!subscription) return;
    setIsLoading(true);
    setMessage("");

    try {
      await subscription.unsubscribe();
      
      // Remove subscription from server
      const response = await fetch('/api/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setSubscription(null);
        setMessage("✅ Push-Benachrichtigungen erfolgreich deaktiviert!");
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setMessage("❌ Fehler beim Deaktivieren der Benachrichtigungen");
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (!subscription) return;
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: "🧪 Test-Benachrichtigung",
          body: "Das ist eine Test-Nachricht von deinen Einstellungen!",
          data: { url: "/settings" }
        }),
      });

      if (response.ok) {
        setMessage("✅ Test-Benachrichtigung gesendet!");
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setMessage("❌ Fehler beim Senden der Test-Benachrichtigung");
    } finally {
      setIsLoading(false);
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
    return (
      <div className="text-center py-8">
        <BellOff className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-2">
          Push-Benachrichtigungen nicht unterstützt
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Dein Browser unterstützt keine Push-Benachrichtigungen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center gap-3">
          {permission === 'granted' && subscription ? (
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-50">
              Push-Benachrichtigungen
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {permission === 'granted' && subscription 
                ? 'Aktiv - Du erhältst Benachrichtigungen' 
                : 'Inaktiv - Keine Benachrichtigungen'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {permission === 'granted' && subscription ? (
            <>
              <button
                onClick={testNotification}
                disabled={isLoading}
                className="btn-secondary text-sm"
              >
                {isLoading ? "Sende..." : "Test"}
              </button>
              <button
                onClick={disableNotifications}
                disabled={isLoading}
                className="btn-danger text-sm"
              >
                {isLoading ? "Deaktiviere..." : "Deaktivieren"}
              </button>
            </>
          ) : (
            <button
              onClick={enableNotifications}
              disabled={isLoading}
              className="btn-primary text-sm"
            >
              {isLoading ? "Aktiviere..." : "Aktivieren"}
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Benachrichtigungstypen */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900 dark:text-slate-50">
          Benachrichtigungstypen
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">Chat-Nachrichten</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Benachrichtigungen bei neuen Nachrichten
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              permission === 'granted' && subscription
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {permission === 'granted' && subscription ? 'Aktiv' : 'Inaktiv'}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">Training-Erinnerungen</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Benachrichtigungen bei neuen Trainings
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              permission === 'granted' && subscription
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {permission === 'granted' && subscription ? 'Aktiv' : 'Inaktiv'}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Über Push-Benachrichtigungen</p>
            <p className="text-blue-800 dark:text-blue-200">
              Du erhältst Benachrichtigungen auch wenn die App nicht geöffnet ist. 
              Du kannst diese jederzeit in den Browser-Einstellungen oder hier deaktivieren.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}