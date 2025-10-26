"use client";

import { useState, useMemo } from "react";
import { UserPlus, Search, Edit, Key, Shield, Users, X } from "lucide-react";
import CreateUserForm from "./CreateUserForm";
import EditUserModal from "./EditUserModal";

interface User {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: string;
  member_id: number | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
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
}

interface Props {
  users: User[];
  members: Member[];
  teams: Team[];
}

export default function UserManagementClient({ users, members, teams }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter und Suche
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.first_name &&
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name &&
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Rolle Badge Farben
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "badge-red";
      case "coach":
        return "badge-blue";
      case "member":
        return "badge-green";
      case "parent":
        return "badge-purple";
      default:
        return "badge-gray";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "coach":
        return "Coach";
      case "member":
        return "Mitglied";
      case "parent":
        return "Elternteil";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Benutzerverwaltung
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {filteredUsers.length} von {users.length} Benutzer
          </p>
        </div>
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
      </div>

      {/* Create User Form (ausklappbar) */}
      {showCreateForm && (
        <div className="card border-2 border-red-500">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Neuen Benutzer erstellen</h2>
            </div>
          </div>
          <div className="card-body">
            <CreateUserForm onSuccess={() => setShowCreateForm(false)} teams={teams} />
          </div>
        </div>
      )}

      {/* Such- und Filterleiste */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="admin">Administrator</option>
                <option value="coach">Coach</option>
                <option value="member">Mitglied</option>
                <option value="parent">Elternteil</option>
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
            <div key={user.id} className="card-hover">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Benutzer-Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {user.name}
                      </h3>
                      <span className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">@{user.username}</p>
                    {user.email && (
                      <p className="text-slate-500 dark:text-slate-500 text-xs">{user.email}</p>
                    )}
                    {user.member_id && user.first_name && user.last_name && (
                      <p className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Verknüpft mit: {user.first_name} {user.last_name}
                        {user.team_name && ` (${user.team_name})`}
                      </p>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Erstellt: {new Date(user.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>

                  {/* Aktionen */}
                  <div>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="btn-secondary"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Bearbeiten</span>
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
            <h2 className="text-lg font-semibold">Rollen-Informationen</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="alert-error">
              <h3 className="font-semibold">Administrator</h3>
              <p className="text-sm mt-1">
                Vollzugriff auf alle Funktionen, kann Benutzer erstellen und verwalten.
              </p>
            </div>
            <div className="alert-info">
              <h3 className="font-semibold">Coach</h3>
              <p className="text-sm mt-1">
                Kann Teams verwalten, Trainings planen und Kommentare schreiben.
              </p>
            </div>
            <div className="alert-success">
              <h3 className="font-semibold">Mitglied</h3>
              <p className="text-sm mt-1">
                Kann eigenes Profil sehen, Trainings zu-/absagen und Kommentare lesen.
              </p>
            </div>
            <div className="alert-warning">
              <h3 className="font-semibold">Elternteil</h3>
              <p className="text-sm mt-1">
                Kann Profile der eigenen Kinder sehen und deren Trainings verwalten.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          members={members}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
