"use client";

import { useState } from "react";
import { Crown, Shield, Users, User, AlertCircle, Check } from "lucide-react";

type UserData = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  member_id: number | null;
  first_name: string | null;
  last_name: string | null;
};

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrator', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20', icon: Crown },
  { value: 'manager', label: 'Manager', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20', icon: Shield },
  { value: 'coach', label: 'Coach', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20', icon: Shield },
  { value: 'parent', label: 'Elternteil', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20', icon: Users },
  { value: 'member', label: 'Mitglied', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20', icon: User },
];

export default function UserRoleManagerMulti({ users }: { users: UserData[] }) {
  const [updating, setUpdating] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userRoles, setUserRoles] = useState<{ [key: number]: string[] }>(() => {
    const initial: { [key: number]: string[] } = {};
    users.forEach(user => {
      initial[user.id] = user.roles && user.roles.length > 0 ? user.roles : [user.role];
    });
    return initial;
  });

  const getRoleInfo = (roleValue: string) => {
    return AVAILABLE_ROLES.find(r => r.value === roleValue) || AVAILABLE_ROLES[4]; // default to member
  };

  const toggleRole = async (userId: number, roleValue: string) => {
    const currentRoles = userRoles[userId] || [];
    let newRoles: string[];

    if (currentRoles.includes(roleValue)) {
      // Remove role (but keep at least one)
      if (currentRoles.length === 1) {
        setMessage({ type: 'error', text: 'Ein Benutzer muss mindestens eine Rolle haben!' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      newRoles = currentRoles.filter(r => r !== roleValue);
    } else {
      // Add role
      newRoles = [...currentRoles, roleValue];
    }

    setUpdating(userId);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${userId}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: newRoles }),
      });

      const result = await response.json();

      if (result.success) {
        setUserRoles(prev => ({ ...prev, [userId]: newRoles }));
        setMessage({ 
          type: 'success', 
          text: 'Rollen erfolgreich aktualisiert! Der Benutzer muss sich abmelden und neu anmelden, damit die Änderungen aktiv werden.' 
        });
        setTimeout(() => setMessage(null), 8000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Fehler beim Aktualisieren der Rollen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler beim Aktualisieren der Rollen' });
    }

    setUpdating(null);
  };

  const getPrimaryRole = (roles: string[]): string => {
    // Priority: admin > manager > coach > parent > member
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('manager')) return 'manager';
    if (roles.includes('coach')) return 'coach';
    if (roles.includes('parent')) return 'parent';
    return 'member';
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
        {users.map((user) => {
          const currentRoles = userRoles[user.id] || [user.role];
          const primaryRole = getPrimaryRole(currentRoles);
          const primaryRoleInfo = getRoleInfo(primaryRole);
          const PrimaryIcon = primaryRoleInfo.icon;

          return (
            <div
              key={user.id}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                      {user.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${primaryRoleInfo.bg} ${primaryRoleInfo.color}`}>
                      <PrimaryIcon className="w-3 h-3" />
                      {primaryRoleInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    @{user.username}
                    {user.first_name && user.last_name && (
                      <span className="ml-2">• {user.first_name} {user.last_name}</span>
                    )}
                  </p>
                </div>
                {updating === user.id && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                )}
              </div>

              {/* All Roles Display */}
              {currentRoles.length > 1 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {currentRoles.filter(r => r !== primaryRole).map(roleValue => {
                    const roleInfo = getRoleInfo(roleValue);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <span 
                        key={roleValue}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${roleInfo.bg} ${roleInfo.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Role Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = currentRoles.includes(role.value);
                  const RoleIcon = role.icon;
                  
                  return (
                    <button
                      key={role.value}
                      onClick={() => toggleRole(user.id, role.value)}
                      disabled={updating === user.id}
                      className={`
                        relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? `${role.bg} ${role.color} border-current` 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-current bg-current' 
                          : 'border-current bg-transparent'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <RoleIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-medium truncate">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Wichtiger Hinweis</h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Nach einer Rollenänderung muss sich der betroffene Benutzer <strong>abmelden und neu anmelden</strong>, 
              damit die neuen Rollen aktiv werden und im System erkannt werden.
            </p>
          </div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Rollenbeschreibungen:</h3>
        <div className="space-y-2 text-sm">
          {AVAILABLE_ROLES.map((role) => {
            const RoleIcon = role.icon;
            return (
              <div key={role.value} className="flex items-start gap-2">
                <RoleIcon className={`w-4 h-4 ${role.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <strong className={role.color}>{role.label}:</strong>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    {role.value === 'admin' && 'Voller Systemzugriff, kann alle Einstellungen ändern und Rollen vergeben'}
                    {role.value === 'manager' && 'Fast voller Zugriff, kann KEINE System-Einstellungen ändern und KEINE Rollen vergeben'}
                    {role.value === 'coach' && 'Kann Teams und Trainings verwalten'}
                    {role.value === 'parent' && 'Kann eigene Kinder verwalten und sehen'}
                    {role.value === 'member' && 'Basis-Zugriff auf eigenes Profil und Trainings'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>💡 Mehrfach-Rollen:</strong> Ein Benutzer kann mehrere Rollen gleichzeitig haben, z.B. Coach + Manager. 
            Klicke einfach auf die gewünschten Rollen, um sie zu aktivieren oder zu deaktivieren.
          </p>
        </div>
      </div>
    </div>
  );
}
