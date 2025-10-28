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
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
          <BellOff className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1 sm:mb-2">
          Nicht unterstützt
        </h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Dein Browser unterstützt keine Push-Benachrichtigungen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Status Card */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-600/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
              permission === 'granted' && subscription
                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
            }`}>
              {permission === 'granted' && subscription ? 
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" /> : 
                <BellOff className="w-5 h-5 sm:w-6 sm:h-6" />
              }
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">
                {permission === 'granted' && subscription ? 'Aktiviert' : 'Deaktiviert'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-tight">
                {permission === 'granted' && subscription 
                  ? 'Du erhältst Push-Benachrichtigungen'
                  : permission === 'denied'
                  ? 'Benachrichtigungen wurden blockiert'
                  : 'Benachrichtigungen sind nicht aktiviert'
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {permission === 'granted' && subscription ? (
              <>
                <button
                  onClick={testNotification}
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg sm:rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isLoading ? "Teste..." : "Test"}
                </button>
                <button
                  onClick={disableNotifications}
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg sm:rounded-xl hover:bg-red-200 dark:hover:bg-red-900/40 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isLoading ? "Deaktiviere..." : "Deaktivieren"}
                </button>
              </>
            ) : (
              <button
                onClick={enableNotifications}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs sm:text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Aktiviere...
                  </div>
                ) : (
                  "Benachrichtigungen aktivieren"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
          message.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            {message.includes('✅') ? 
              <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" /> : 
              <X className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            }
            <p className="font-medium text-xs sm:text-sm leading-relaxed">{message}</p>
          </div>
        </div>
      )}

      {/* Notification Types */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
          Benachrichtigungstypen
        </h3>
        
        <div className="grid gap-3 sm:gap-4">
          <div className="group p-4 sm:p-6 bg-white dark:bg-slate-700/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">Chat-Nachrichten</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 leading-tight">
                    Benachrichtigungen bei neuen Nachrichten im Team-Chat
                  </p>
                </div>
              </div>
              <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                permission === 'granted' && subscription
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
              }`}>
                {permission === 'granted' && subscription ? 'Aktiv' : 'Inaktiv'}
              </div>
            </div>
          </div>

          <div className="group p-4 sm:p-6 bg-white dark:bg-slate-700/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">Training-Erinnerungen</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 leading-tight">
                    Benachrichtigungen bei neuen Trainings und Terminen
                  </p>
                </div>
              </div>
              <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                permission === 'granted' && subscription
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
              }`}>
                {permission === 'granted' && subscription ? 'Aktiv' : 'Inaktiv'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 sm:mb-2 text-sm sm:text-base">
              Über Push-Benachrichtigungen
            </h4>
            <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1 sm:space-y-2 leading-relaxed">
              <p>
                Du erhältst Benachrichtigungen auch wenn die App nicht geöffnet ist.
              </p>
              <p>
                Die Benachrichtigungen können jederzeit in den Browser-Einstellungen oder hier deaktiviert werden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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