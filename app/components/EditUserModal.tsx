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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 card-header bg-white dark:bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Benutzer bearbeiten</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost w-10 h-10 !p-0"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="card-body space-y-6">
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
          {success && (
            <div className="alert-success">
              {success}
            </div>
          )}

          {/* Basis-Informationen */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Basis-Informationen
            </h3>

            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Benutzername *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input"
                required
                pattern="[a-z0-9_]+"
                title="Nur Kleinbuchstaben, Zahlen und Unterstriche"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Wird für den Login verwendet (nur a-z, 0-9, _)
              </p>
            </div>

            <div>
              <label className="label">E-Mail (optional)</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Rolle *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input"
                required
              >
                <option value="admin">Administrator</option>
                <option value="coach">Coach</option>
                <option value="member">Mitglied</option>
                <option value="parent">Elternteil</option>
              </select>
            </div>

            <div>
              <label className="label">Verknüpftes Mitglied (optional)</label>
              <select
                value={formData.member_id}
                onChange={(e) =>
                  setFormData({ ...formData, member_id: e.target.value })
                }
                className="input"
              >
                <option value="">Kein Mitglied verknüpft</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                    {member.team_name && ` (${member.team_name})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verknüpfe diesen Benutzer mit einem Mitglied für erweiterte Funktionen
              </p>
            </div>
          </div>

          {/* Passwort ändern */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" />
              Passwort ändern (optional)
            </h3>

            <div>
              <label className="label">Neues Passwort</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="input"
                placeholder="Mindestens 6 Zeichen"
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Passwort bestätigen</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="input"
                placeholder="Passwort wiederholen"
              />
            </div>
          </div>

          {/* Aktionen */}
          <div className="card-footer flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn-secondary text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <Trash2 className="w-4 h-4" />
              Löschen
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
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
