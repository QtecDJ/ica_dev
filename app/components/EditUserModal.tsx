"use client";

import { useState } from "react";
import { X, Key, Shield, Users, Trash2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

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
  user: User;
  members: Member[];
  onClose: () => void;
}

export default function EditUserModal({ user, members, onClose }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email || "",
    role: user.role,
    member_id: user.member_id?.toString() || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validierung
    if (!formData.name || !formData.username || !formData.role) {
      setError("Name, Benutzername und Rolle sind erforderlich!");
      setLoading(false);
      return;
    }

    // Passwort-Validierung
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Die Passwörter stimmen nicht überein!");
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setError("Das Passwort muss mindestens 6 Zeichen lang sein!");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email || null,
          role: formData.role,
          member_id: formData.member_id ? parseInt(formData.member_id) : null,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Aktualisieren");
      }

      setSuccess("Benutzer erfolgreich aktualisiert!");
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Möchtest du den Benutzer "${user.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Löschen");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 lg:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Benutzer bearbeiten</h2>
              <p className="text-sm text-gray-400">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Basis-Informationen */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Basis-Informationen
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Benutzername *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input w-full"
                required
                pattern="[a-z0-9_]+"
                title="Nur Kleinbuchstaben, Zahlen und Unterstriche"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird für den Login verwendet (nur a-z, 0-9, _)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail (optional)
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rolle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input w-full"
                required
              >
                <option value="admin">Administrator</option>
                <option value="coach">Coach</option>
                <option value="member">Mitglied</option>
                <option value="parent">Elternteil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verknüpftes Mitglied (optional)
              </label>
              <select
                value={formData.member_id}
                onChange={(e) =>
                  setFormData({ ...formData, member_id: e.target.value })
                }
                className="input w-full"
              >
                <option value="">Kein Mitglied verknüpft</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                    {member.team_name && ` (${member.team_name})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Verknüpfe diesen Benutzer mit einem Mitglied für erweiterte Funktionen
              </p>
            </div>
          </div>

          {/* Passwort ändern */}
          <div className="space-y-4 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" />
              Passwort ändern (optional)
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Neues Passwort
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="input w-full"
                placeholder="Mindestens 6 Zeichen"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="input w-full"
                placeholder="Passwort wiederholen"
              />
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex flex-col-reverse lg:flex-row gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Löschen
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 justify-center"
            >
              <Save className="w-4 h-4" />
              {loading ? "Wird gespeichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
