"use client";

import { useState } from "react";
import { X, Shield, Users, Save, Download, AlertCircle, User } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: string;
  roles?: string[];
  member_id: number | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
  status?: 'active' | 'inactive';
}

interface Team {
  id: number;
  name: string;
  coach: string | null; // Coach ist der Name, nicht die ID!
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  team_name: string | null;
}

interface RoleConfig {
  label: string;
  color: string;
  permissions: string[];
  priority: number;
}

interface Props {
  user: User;
  members: Member[];
  teams: Team[];
  availableRoles: Record<string, RoleConfig>;
  onClose: () => void;
  onUserUpdate?: () => void; // Callback für Updates
}

export default function EditUserModalImproved({ user, members, teams, availableRoles, onClose, onUserUpdate }: Props) {
  // Finde das Team, bei dem dieser User als Coach eingetragen ist
  // coach Spalte enthält User ID als String
  const currentTeam = teams.find(team => team.coach === user.id.toString());
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || "",
    roles: user.roles || [user.role],
    member_id: user.member_id?.toString() || "",
    team_id: currentTeam?.id.toString() || "", // Aktuelles Team des Coaches
    status: user.status || 'active',
    resetPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formData.roles.length === 0) {
        throw new Error("Bitte wählen Sie mindestens eine Rolle aus.");
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: user.username, // Benutzername bleibt unverändert
          email: formData.email,
          role: formData.roles[0], // Hauptrolle (erste Rolle)
          roles: formData.roles, // Alle Rollen
          member_id: formData.member_id ? parseInt(formData.member_id) : null,
          teamId: formData.team_id ? parseInt(formData.team_id) : null, // Team-Zuweisung für Coaches
          status: formData.status,
          newPassword: formData.resetPassword ? true : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Fehler beim Aktualisieren des Benutzers");
      }

      // Wenn Server ein neues Passwort zurückgibt, zeige es dem Admin an
      if (result.newPassword) {
        setGeneratedPassword(result.newPassword);
        setSuccess("Benutzer erfolgreich aktualisiert. Neues Passwort generiert.");
      } else {
        setSuccess("Benutzer erfolgreich aktualisiert!");
      }

      // Rufe Callback auf, um Parent-Component zu aktualisieren
      if (onUserUpdate) {
        onUserUpdate();
      }

      // Nach 2 Sekunden schließen (falls kein neues Passwort angezeigt wird)
      setTimeout(() => {
        // wenn ein Passwort angezeigt wird, lasse das Modal offen, damit Admin es kopieren kann
        if (!result.newPassword) {
          onClose();
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCredentials = async () => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Benutzer bearbeiten
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user.name} (@{user.username})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="alert-error">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="alert-success">
              <AlertCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grunddaten */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <User className="w-5 h-5" />
                Grunddaten
              </h3>

              <div>
                <label htmlFor="edit-name" className="label">
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-username" className="label">
                  Benutzername
                </label>
                <input
                  type="text"
                  id="edit-username"
                  value={user.username}
                  className="input bg-gray-100 dark:bg-gray-700"
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Der Benutzername kann nicht geändert werden.
                </p>
              </div>

              <div>
                <label htmlFor="edit-email" className="label">
                  E-Mail Adresse
                </label>
                <input
                  type="email"
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="edit-status" className="label">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="input"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>
            </div>

            {/* Rollen und Berechtigungen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Rollen und Berechtigungen *
              </h3>

              <div className="space-y-3">
                {Object.entries(availableRoles).map(([role, config]) => (
                  <div key={role} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id={`edit-role-${role}`}
                        checked={formData.roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={`edit-role-${role}`} className="flex items-center gap-2 cursor-pointer">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </label>
                    </div>
                    {formData.roles.includes(role) && (
                      <div className="ml-6 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {config.permissions.slice(0, 2).map((permission, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            {permission}
                          </div>
                        ))}
                        {config.permissions.length > 2 && (
                          <div className="text-slate-500">
                            ... und {config.permissions.length - 2} weitere
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verknüpfungen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Verknüpfungen
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mitglieder-Verknüpfung */}
              <div>
                <label htmlFor="edit-member_id" className="label">
                  Verknüpftes Mitglied
                </label>
                <select
                  id="edit-member_id"
                  value={formData.member_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                  className="input"
                >
                  <option value="">Kein Mitglied verknüpfen</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                      {member.team_name && ` (${member.team_name})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coach-Team-Zuweisung */}
              {formData.roles.includes("coach") && (
                <div>
                  <label htmlFor="edit-team_id" className="label">
                    Team-Zuweisung (für Coaches)
                  </label>
                  <select
                    id="edit-team_id"
                    value={formData.team_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value }))}
                    className="input"
                  >
                    <option value="">Kein Team zuweisen</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Coaches können einem Team zugewiesen werden
                  </p>
                </div>
              )}

              {/* Passwort zurücksetzen */}
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="resetPassword"
                  checked={formData.resetPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, resetPassword: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="resetPassword" className="text-sm text-slate-700 dark:text-slate-300">
                  Neues temporäres Passwort generieren
                </label>
              </div>
            </div>
          </div>

          {/* Benutzer-Info */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-50">Benutzer-Informationen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div><strong>Erstellt:</strong> {new Date(user.created_at).toLocaleString("de-DE")}</div>
              <div><strong>ID:</strong> {user.id}</div>
              {user.first_name && user.last_name && (
                <div className="md:col-span-2">
                  <strong>Verknüpftes Mitglied:</strong> {user.first_name} {user.last_name}
                  {user.team_name && ` (${user.team_name})`}
                </div>
              )}
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading || formData.roles.length === 0}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Änderungen speichern
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCredentials}
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              Zugangsdaten PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Abbrechen
            </button>
          </div>

            {formData.resetPassword && (
            <div className="alert-warning">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Passwort wird zurückgesetzt!</p>
                <p className="text-sm mt-1">
                  Ein neues temporäres Passwort wird generiert. Stellen Sie sicher, dass Sie dem Benutzer 
                  die neuen Zugangsdaten mitteilen.
                </p>
              </div>
            </div>
          )}

            {generatedPassword && (
              <div className="alert-success">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium">Neues temporäres Passwort</p>
                    <p className="text-sm mt-1">Kopieren Sie das Passwort und geben Sie es dem Benutzer weiter. Es ist nur einmal sichtbar.</p>
                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded border">
                      <code className="text-lg font-semibold">{generatedPassword}</code>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                      }}
                      className="btn-primary"
                    >
                      Kopieren
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedPassword(null);
                        window.location.reload();
                      }}
                      className="btn-outline"
                    >
                      Fertig
                    </button>
                  </div>
                </div>
              </div>
            )}
        </form>
      </div>
    </div>
  );
}