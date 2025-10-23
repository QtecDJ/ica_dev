"use client";

import { useState } from "react";
import { User, Lock, Shield, UserCircle, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

// Passwort-Generator-Funktion
function generatePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  // Mindestens ein Zeichen von jedem Typ
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Restliche Zeichen zufällig
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "member" as "admin" | "coach" | "member" | "parent",
    createMemberProfile: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleGeneratePassword() {
    const newPassword = generatePassword(12);
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Fehler beim Erstellen des Benutzers");
        return;
      }

      setSuccess(`Benutzer "${formData.username}" erfolgreich erstellt!`);
      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        role: "member",
        createMemberProfile: true,
      });
      
      // Callback aufrufen falls vorhanden
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benutzername *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
            placeholder="z.B. max_mustermann"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Wird für den Login verwendet (nur Kleinbuchstaben, Zahlen und Unterstriche)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vollständiger Name *
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
            placeholder="Max Mustermann"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          E-Mail (optional)
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
            placeholder="max@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Passwort *
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
              placeholder="Mindestens 6 Zeichen"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            title="Zufälliges Passwort generieren"
          >
            <RefreshCw className="w-5 h-5" />
            Generieren
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            Passwort anzeigen
          </label>
          {formData.password && (
            <p className="text-xs text-gray-500">
              Stärke: {formData.password.length >= 12 ? '🟢 Stark' : formData.password.length >= 8 ? '🟡 Mittel' : '🔴 Schwach'}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Der Benutzer kann das Passwort später selbst ändern
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rolle *
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as typeof formData.role,
              })
            }
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all appearance-none bg-white"
            required
          >
            <option value="member">Mitglied</option>
            <option value="parent">Elternteil</option>
            <option value="coach">Coach</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {(formData.role === "member" || formData.role === "coach") && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.createMemberProfile}
              onChange={(e) =>
                setFormData({ ...formData, createMemberProfile: e.target.checked })
              }
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Mitgliederprofil erstellen
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Erstellt automatisch ein Profil auf der Mitglieder-Seite mit Vor- und Nachname aus dem vollständigen Namen.
                {formData.role === "coach" && " Coaches werden auch als Mitglieder angezeigt."}
              </p>
            </div>
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isLoading ? "Wird erstellt..." : "Benutzer erstellen"}
      </button>
    </form>
  );
}
