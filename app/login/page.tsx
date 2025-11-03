"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, User, Lock, AlertCircle, Download, Smartphone } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS - show instructions
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert(
          'Um diese App zu installieren, tippe auf das Teilen-Symbol und wähle "Zum Home-Bildschirm"'
        );
        return;
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ungültiger Benutzername oder Passwort");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-4 p-2">
            <Image
              src="/logo.png"
              alt="Infinity Cheer Allstars Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            Infinity Cheer Allstars
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Backoffice Login
          </p>
        </div>

        {/* PWA Install Button */}
        {showInstallButton && (
          <div className="mb-4">
            <button
              onClick={handleInstallClick}
              className="w-full btn btn-secondary flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>App installieren</span>
            </button>
          </div>
        )}

        {/* Login Card */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                <LogIn className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Anmelden</h2>
            </div>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert-error mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="label">
                  Benutzername
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input pl-10"
                    placeholder="Benutzername eingeben"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
