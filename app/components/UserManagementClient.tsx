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

interface Props {
  users: User[];
  members: Member[];
}

export default function UserManagementClient({ users, members }: Props) {
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
        return "bg-red-100 text-red-800 border-red-300";
      case "coach":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "member":
        return "bg-green-100 text-green-800 border-green-300";
      case "parent":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Benutzerverwaltung
            </h1>
            <p className="text-gray-400">
              {filteredUsers.length} von {users.length} Benutzer
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2 justify-center w-full lg:w-auto"
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
      </div>

      {/* Create User Form (ausklappbar) */}
      {showCreateForm && (
        <div className="card mb-6 lg:mb-8 border-2 border-red-500">
          <div className="card-header flex items-center gap-3">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-lg lg:text-xl font-semibold">
              Neuen Benutzer erstellen
            </h2>
          </div>
          <div className="p-4 lg:p-6">
            <CreateUserForm onSuccess={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      {/* Such- und Filterleiste */}
      <div className="card mb-6 lg:mb-8">
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Suchfeld */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Suche nach Name, Benutzername oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Rollenfilter */}
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input pl-10 w-full"
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
          <div className="card p-8 text-center">
            <p className="text-gray-400">Keine Benutzer gefunden.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="card hover:border-red-500 transition-colors">
              <div className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Benutzer-Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {user.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                    {user.email && (
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    )}
                    {user.member_id && user.first_name && user.last_name && (
                      <p className="text-cyan-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Verknüpft mit: {user.first_name} {user.last_name}
                        {user.team_name && ` (${user.team_name})`}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      Erstellt: {new Date(user.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>

                  {/* Aktionen */}
                  <div className="flex gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="btn-secondary flex items-center gap-2 justify-center flex-1 lg:flex-initial"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="lg:inline">Bearbeiten</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rollen-Informationen */}
      <div className="card mt-6 lg:mt-8">
        <div className="card-header flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg lg:text-xl font-semibold">Rollen-Informationen</h2>
        </div>
        <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-950/50 border-l-4 border-red-600 rounded">
            <h3 className="font-bold text-red-400 mb-1">Administrator</h3>
            <p className="text-sm text-gray-300">
              Vollzugriff auf alle Funktionen, kann Benutzer erstellen und verwalten.
            </p>
          </div>
          <div className="p-4 bg-blue-950/50 border-l-4 border-blue-600 rounded">
            <h3 className="font-bold text-blue-400 mb-1">Coach</h3>
            <p className="text-sm text-gray-300">
              Kann Teams verwalten, Trainings planen und Kommentare schreiben.
            </p>
          </div>
          <div className="p-4 bg-green-950/50 border-l-4 border-green-600 rounded">
            <h3 className="font-bold text-green-400 mb-1">Mitglied</h3>
            <p className="text-sm text-gray-300">
              Kann eigenes Profil sehen, Trainings zu-/absagen und Kommentare lesen.
            </p>
          </div>
          <div className="p-4 bg-purple-950/50 border-l-4 border-purple-600 rounded">
            <h3 className="font-bold text-purple-400 mb-1">Elternteil</h3>
            <p className="text-sm text-gray-300">
              Kann Profile der eigenen Kinder sehen und deren Trainings verwalten.
            </p>
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
