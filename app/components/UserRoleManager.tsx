"use client";

import { useState } from "react";
import { Crown, Shield, Users, User, AlertCircle } from "lucide-react";
import { updateUserRole } from "@/app/actions";

type UserData = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  member_id: number | null;
  first_name: string | null;
  last_name: string | null;
};

export default function UserRoleManager({ users }: { users: UserData[] }) {
  const [updating, setUpdating] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'manager':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      case 'coach':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'parent':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      default:
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'manager':
      case 'coach':
        return <Shield className="w-4 h-4" />;
      case 'parent':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'coach':
        return 'Coach';
      case 'parent':
        return 'Elternteil';
      default:
        return 'Mitglied';
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdating(userId);
    setMessage(null);

    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      setMessage({ type: 'success', text: 'Rolle erfolgreich aktualisiert!' });
      setTimeout(() => setMessage(null), 3000);
      // Reload page to reflect changes
      window.location.reload();
    } else {
      setMessage({ type: 'error', text: result.error || 'Fehler beim Aktualisieren der Rolle' });
    }

    setUpdating(null);
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                    {user.name}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  @{user.username}
                  {user.first_name && user.last_name && (
                    <span className="ml-2">• {user.first_name} {user.last_name}</span>
                  )}
                </p>
              </div>

              {/* Role Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updating === user.id}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 text-sm"
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="coach">Coach</option>
                  <option value="parent">Elternteil</option>
                  <option value="member">Mitglied</option>
                </select>
                {updating === user.id && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Rollenbeschreibungen:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Crown className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-red-600 dark:text-red-400">Administrator:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                Voller Systemzugriff, kann alle Einstellungen ändern und Rollen vergeben
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-orange-600 dark:text-orange-400">Manager:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                Fast voller Zugriff, kann KEINE System-Einstellungen ändern und KEINE Rollen vergeben
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-blue-600 dark:text-blue-400">Coach:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                Kann Teams und Trainings verwalten
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-green-600 dark:text-green-400">Elternteil:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                Kann eigene Kinder verwalten und sehen
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-purple-600 dark:text-purple-400">Mitglied:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                Basis-Zugriff auf eigenes Profil und Trainings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
