"use client";

import { useState, useMemo } from "react";
import { UserPlus, Search, Edit, Download, Shield, Users, X, Plus, Minus, Eye, Trash2, RotateCcw } from "lucide-react";
import CreateUserFormImproved from "./CreateUserFormImproved";
import EditUserModalImproved from "./EditUserModalImproved";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: string;
  roles?: string[]; // Für Multi-Rollen Support
  member_id: number | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
  last_login?: string | null;
  status?: 'active' | 'inactive';
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  team_name: string | null;
}

interface Team {
  id: number;
  name: string;
  coach: string | null; // Coach ist der Name als String, nicht ID
}

interface Props {
  users: User[];
  members: Member[];
  teams: Team[];
  onUserUpdate?: () => void; // Callback für Updates
}

// Verfügbare Rollen mit Beschreibungen und Berechtigungen
const AVAILABLE_ROLES = {
  admin: {
    label: "Administrator",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    permissions: [
      "Vollzugriff auf alle Funktionen",
      "Benutzer erstellen und verwalten", 
      "System-Einstellungen ändern",
      "Alle Daten einsehen und bearbeiten",
      "Kann Rollen vergeben"
    ],
    priority: 1
  },
  manager: {
    label: "Manager",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    permissions: [
      "Fast vollständiger Zugriff",
      "Benutzer erstellen (keine Rollenvergabe)",
      "Mitglieder und Teams verwalten",
      "Trainings und Events verwalten",
      "KEINE System-Einstellungen",
      "KEINE Rollenvergabe"
    ],
    priority: 2
  },
  coach: {
    label: "Coach",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    permissions: [
      "Teams verwalten",
      "Trainings planen und durchführen",
      "Kommentare und Bewertungen schreiben",
      "Mitgliederprofile bearbeiten"
    ],
    priority: 3
  },
  parent: {
    label: "Elternteil", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    permissions: [
      "Profile der eigenen Kinder einsehen",
      "Trainings zu-/absagen für Kinder",
      "Kommunikation mit Coaches",
      "Eigene Kontaktdaten verwalten"
    ],
    priority: 4
  },
  member: {
    label: "Mitglied",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", 
    permissions: [
      "Eigenes Profil einsehen",
      "Trainings zu-/absagen",
      "Kommentare lesen",
      "Teamkameraden anzeigen"
    ],
    priority: 5
  }
};

export default function UserManagementImproved({ users, members, teams, onUserUpdate }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  // Konvertiere Single-Role zu Multi-Role Format
  const usersWithMultiRoles = useMemo(() => {
    return users.map(user => ({
      ...user,
      roles: user.roles || [user.role], // Fallback zu Single-Role
      status: user.status || 'active'
    }));
  }, [users]);

  // Filter und Suche
  const filteredUsers = useMemo(() => {
    return usersWithMultiRoles.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersWithMultiRoles, searchTerm, roleFilter, statusFilter]);

  // Statistiken
  const stats = useMemo(() => {
    const totalUsers = usersWithMultiRoles.length;
    const activeUsers = usersWithMultiRoles.filter(u => u.status === 'active').length;
    const roleStats = Object.keys(AVAILABLE_ROLES).reduce((acc, role) => {
      acc[role] = usersWithMultiRoles.filter(u => u.roles.includes(role)).length;
      return acc;
    }, {} as Record<string, number>);

    return { totalUsers, activeUsers, roleStats };
  }, [usersWithMultiRoles]);

  // Rolle Badges rendern
  const renderRoleBadges = (roles: string[]) => {
    return roles
      .sort((a, b) => (AVAILABLE_ROLES[a as keyof typeof AVAILABLE_ROLES]?.priority || 99) - 
                     (AVAILABLE_ROLES[b as keyof typeof AVAILABLE_ROLES]?.priority || 99))
      .map(role => (
        <span 
          key={role}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            AVAILABLE_ROLES[role as keyof typeof AVAILABLE_ROLES]?.color || 'bg-gray-100 text-gray-800'
          }`}
          title={AVAILABLE_ROLES[role as keyof typeof AVAILABLE_ROLES]?.label || role}
        >
          {AVAILABLE_ROLES[role as keyof typeof AVAILABLE_ROLES]?.label || role}
        </span>
      ));
  };

  // PDF Download für Benutzer-Zugangsdaten
  const handleDownloadUserCredentials = async (user: User) => {
    try {
      const response = await fetch('/api/users/generate-credentials-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) throw new Error('PDF Generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `zugangsdaten_${user.username}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim PDF-Download:', error);
      alert('Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
    }
  };

  // Passwort zurücksetzen und PDF mit neuem Passwort generieren
  const handleResetPassword = async (user: User) => {
    if (!confirm(`Möchten Sie das Passwort für ${user.name || user.username} wirklich zurücksetzen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Passwort-Reset fehlgeschlagen');
      
      const data = await response.json();
      
      // PDF mit neuem Passwort generieren
      const pdfResponse = await fetch('/api/users/generate-credentials-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          username: user.username,
          password: data.newPassword,
          name: user.name,
          email: user.email,
          roles: [user.role]
        })
      });
      
      if (pdfResponse.ok) {
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `neue_zugangsdaten_${user.username}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      alert(`Passwort für ${user.name || user.username} wurde zurückgesetzt. PDF wird heruntergeladen.`);
      
    } catch (error) {
      console.error('Fehler beim Passwort-Reset:', error);
      alert('Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.');
    }
  };

  // Benutzer löschen
  const handleDeleteUser = async (user: User) => {
    // Verhindere das Löschen von Admins (zusätzliche Sicherheit)
    if (user.role === 'admin') {
      if (!confirm(`⚠️ WARNUNG: Sie sind dabei einen Administrator zu löschen!\n\nBenutzer: ${user.name || user.username}\n\nSind Sie absolut sicher? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
        return;
      }
    } else {
      if (!confirm(`Möchten Sie den Benutzer ${user.name || user.username} wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden und löscht alle verknüpften Daten.`)) {
        return;
      }
    }

    // UI-Loading-State
    const originalButtonText = document.querySelector(`[data-user-id="${user.id}"]`)?.textContent;
    const buttonElement = document.querySelector(`[data-user-id="${user.id}"]`);
    if (buttonElement) buttonElement.textContent = 'Wird gelöscht...';

    try {
      console.log(`🗑️ Attempting to delete user ${user.id}: ${user.username}`);
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include' // Wichtig für Session-Cookies
      });
      
      console.log(`📡 Delete response status: ${response.status}`);
      
      // Behandle verschiedene HTTP-Status-Codes
      if (response.status === 401) {
        throw new Error('❌ Keine Berechtigung zum Löschen. Bitte loggen Sie sich erneut ein.');
      }
      
      if (response.status === 403) {
        throw new Error('❌ Zugriff verweigert. Nur Administratoren können Benutzer löschen.');
      }
      
      if (response.status === 404) {
        throw new Error('❌ Benutzer nicht gefunden. Möglicherweise bereits gelöscht.');
      }
      
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({ error: 'Bad Request' }));
        throw new Error(errorData.error || '❌ Ungültige Anfrage');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        console.error('🚫 Delete API error:', errorData);
        throw new Error(errorData.error || `❌ Server-Fehler (${response.status})`);
      }
      
      const result = await response.json();
      console.log('✅ Delete successful:', result);
      
      // Benutzer aus den ausgewählten Benutzern entfernen
      setSelectedUsers(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(user.id);
        return newSelected;
      });
      
      // Erfolgs-Feedback
      alert(`✅ Benutzer ${user.name || user.username} wurde erfolgreich gelöscht.`);
      
      // Rufe das Update-Callback auf, um die Liste zu aktualisieren
      if (onUserUpdate) {
        onUserUpdate();
      } else {
        // Fallback: Seite neu laden wenn kein Callback vorhanden
        window.location.reload();
      }
      
    } catch (error) {
      console.error('💥 Fehler beim Löschen:', error);
      
      // Reset Button
      if (buttonElement && originalButtonText) {
        buttonElement.textContent = originalButtonText;
      }
      
      const errorMessage = error instanceof Error ? error.message : '❌ Unbekannter Fehler';
      
      // Benutzerfreundliche Fehlermeldung
      alert(`Fehler beim Löschen des Benutzers:\n\n${errorMessage}\n\n💡 Mögliche Lösungen:\n• Prüfen Sie Ihre Internetverbindung\n• Loggen Sie sich erneut ein\n• Kontaktieren Sie den Support`);
    }
  };

  // Bulk-Aktionen
  const handleBulkAction = (action: string) => {
    if (selectedUsers.size === 0) {
      alert('Bitte wählen Sie mindestens einen Benutzer aus.');
      return;
    }

    switch (action) {
      case 'download-all':
        selectedUsers.forEach(userId => {
          const user = usersWithMultiRoles.find(u => u.id === userId);
          if (user) handleDownloadUserCredentials(user);
        });
        break;
      case 'deactivate':
        // TODO: Implementiere Bulk-Deaktivierung
        console.log('Deaktiviere User:', Array.from(selectedUsers));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header mit Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Benutzerverwaltung
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {filteredUsers.length} von {stats.totalUsers} Benutzer
          </p>
        </div>
        
        {/* Statistik-Karten */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeUsers}</div>
          <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Aktive Benutzer</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.roleStats.coach || 0}</div>
          <div className="text-sm text-green-600/80 dark:text-green-400/80">Coaches</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.roleStats.parent || 0}</div>
          <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Eltern</div>
        </div>
      </div>

      {/* Aktionsleiste */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? (
              <>
                <X className="w-4 h-4" />
                Schließen
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Neuer Benutzer
              </>
            )}
          </button>
          
          {selectedUsers.size > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('download-all')}
                className="btn-secondary"
              >
                <Download className="w-4 h-4" />
                PDFs herunterladen ({selectedUsers.size})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Create User Form (ausklappbar) */}
      {showCreateForm && (
        <div className="card border-2 border-indigo-500">
          <div className="card-header bg-indigo-50 dark:bg-indigo-900/20">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
                Neuen Benutzer erstellen
              </h2>
            </div>
          </div>
          <div className="card-body">
            <CreateUserFormImproved 
              onSuccess={() => setShowCreateForm(false)} 
              teams={teams} 
              members={members}
              availableRoles={AVAILABLE_ROLES}
            />
          </div>
        </div>
      )}

      {/* Such- und Filterleiste */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Suchfeld */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Suche nach Name, Benutzername oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Rollenfilter */}
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="all">Alle Rollen</option>
                {Object.entries(AVAILABLE_ROLES).map(([role, config]) => (
                  <option key={role} value={role}>
                    {config.label} ({stats.roleStats[role] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Benutzer-Liste */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="card">
            <div className="card-body text-center text-slate-500 dark:text-slate-400">
              Keine Benutzer gefunden.
            </div>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="card-hover border-l-4 border-l-transparent hover:border-l-indigo-500">
              <div className="card-body">
                <div className="flex items-center gap-4">
                  {/* Checkbox für Bulk-Aktionen */}
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedUsers);
                      if (e.target.checked) {
                        newSelected.add(user.id);
                      } else {
                        newSelected.delete(user.id);
                      }
                      setSelectedUsers(newSelected);
                    }}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />

                  {/* Benutzer-Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {user.name}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {renderRoleBadges(user.roles)}
                      </div>
                      {user.status === 'inactive' && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                          Inaktiv
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>
                        <strong>Username:</strong> @{user.username}
                      </div>
                      {user.email && (
                        <div>
                          <strong>E-Mail:</strong> {user.email}
                        </div>
                      )}
                      <div>
                        <strong>Erstellt:</strong> {new Date(user.created_at).toLocaleDateString("de-DE")}
                      </div>
                    </div>

                    {user.member_id && user.first_name && user.last_name && (
                      <p className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Verknüpft mit: {user.first_name} {user.last_name}
                        {user.team_name && ` (${user.team_name})`}
                      </p>
                    )}
                  </div>

                  {/* Aktionen */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadUserCredentials(user)}
                      className="btn-outline text-xs"
                      title="Zugangsdaten als PDF herunterladen"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="btn-outline text-xs text-orange-600 hover:text-orange-700"
                      title="Passwort zurücksetzen"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="btn-secondary text-xs"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="btn-outline text-xs text-red-600 hover:text-red-700"
                      title="Benutzer löschen"
                      data-user-id={user.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rollen-Informationen */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Rollen und Berechtigungen</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(AVAILABLE_ROLES).map(([role, config]) => (
              <div key={role} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-sm text-slate-500">({stats.roleStats[role] || 0} Benutzer)</span>
                </div>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {config.permissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModalImproved
          user={editingUser}
          members={members}
          teams={teams}
          availableRoles={AVAILABLE_ROLES}
          onClose={() => setEditingUser(null)}
          onUserUpdate={onUserUpdate}
        />
      )}
    </div>
  );
}