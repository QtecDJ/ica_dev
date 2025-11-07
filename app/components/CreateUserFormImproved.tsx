"use client";

import { useState } from "react";
import { User, Mail, Key, Shield, Users, Download, AlertCircle } from "lucide-react";

interface Team {
  id: number;
  name: string;
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
  onSuccess: () => void;
  teams: Team[];
  members: Member[];
  availableRoles: Record<string, RoleConfig>;
}

export default function CreateUserFormImproved({ onSuccess, teams, members, availableRoles }: Props) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    roles: [] as string[],
    member_id: "",
    team_id: "",
    generatePassword: true,
    customPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdUser, setCreatedUser] = useState<any>(null);

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const generateUsername = () => {
    if (!formData.name) return;
    
    const name = formData.name.toLowerCase()
      .replace(/[äöüß]/g, char => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[char] || char))
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    setFormData(prev => ({ ...prev, username: name }));
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

      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          member_id: formData.member_id ? parseInt(formData.member_id) : null,
          team_id: formData.team_id ? parseInt(formData.team_id) : null,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Fehler beim Erstellen des Benutzers");
      }

      setSuccess("Benutzer erfolgreich erstellt!");
      setCreatedUser(result.user);
      
      // Form nach kurzer Verzögerung zurücksetzen
      setTimeout(() => {
        setFormData({
          username: "",
          name: "",
          email: "",
          roles: [],
          member_id: "",
          team_id: "",
          generatePassword: true,
          customPassword: "",
        });
        setCreatedUser(null);
        onSuccess();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCredentials = async () => {
    if (!createdUser) return;
    
    try {
      const response = await fetch('/api/users/generate-credentials-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: createdUser.id,
          username: createdUser.username,
          password: createdUser.temporaryPassword,
          name: createdUser.name,
          email: createdUser.email,
          roles: createdUser.roles
        })
      });
      
      if (!response.ok) throw new Error('PDF Generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `zugangsdaten_${createdUser.username}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim PDF-Download:', error);
      alert('Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.');
    }
  };

  if (success && createdUser) {
    return (
      <div className="space-y-6">
        <div className="alert-success">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <strong>Benutzer erfolgreich erstellt!</strong>
          </div>
          <div className="mt-2 space-y-1">
            <p><strong>Benutzername:</strong> {createdUser.username}</p>
            <p><strong>Temporäres Passwort:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{createdUser.temporaryPassword}</code></p>
            <p><strong>Rollen:</strong> {createdUser.roles?.join(", ") || createdUser.role}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadCredentials}
            className="btn-primary"
          >
            <Download className="w-4 h-4" />
            Zugangsdaten als PDF herunterladen
          </button>
          <button
            onClick={() => {
              setCreatedUser(null);
              setSuccess("");
              onSuccess();
            }}
            className="btn-outline"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert-error">
          <AlertCircle className="w-5 h-5" />
          {error}
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
            <label htmlFor="name" className="label">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onBlur={generateUsername}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="label">
              Benutzername *
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="input"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Wird automatisch aus dem Namen generiert, kann aber angepasst werden.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="label">
              E-Mail Adresse
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input"
            />
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
                    id={`role-${role}`}
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`role-${role}`} className="flex items-center gap-2 cursor-pointer">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mitglieder-Verknüpfung */}
        {formData.roles.includes('member') && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Mitglieder-Verknüpfung
            </h3>
            
            <div>
              <label htmlFor="member_id" className="label">
                Verknüpftes Mitglied
              </label>
              <select
                id="member_id"
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
          </div>
        )}

        {/* Coach Team-Zuweisung */}
        {formData.roles.includes('coach') && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Team-Zuweisung
            </h3>
            
            <div>
              <label htmlFor="team_id" className="label">
                Team (als Coach)
              </label>
              <select
                id="team_id"
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
            </div>
          </div>
        )}
      </div>

      {/* Passwort */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Passwort
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="generatePassword"
            checked={formData.generatePassword}
            onChange={(e) => setFormData(prev => ({ ...prev, generatePassword: e.target.checked }))}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="generatePassword" className="text-sm text-slate-700 dark:text-slate-300">
            Temporäres Passwort automatisch generieren (empfohlen)
          </label>
        </div>

        {!formData.generatePassword && (
          <div>
            <label htmlFor="customPassword" className="label">
              Benutzerdefiniertes Passwort
            </label>
            <input
              type="password"
              id="customPassword"
              value={formData.customPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, customPassword: e.target.value }))}
              className="input"
              required={!formData.generatePassword}
            />
          </div>
        )}
      </div>

      {/* Aktionen */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading || formData.roles.length === 0}
          className="btn-primary"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Wird erstellt...
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              Benutzer erstellen
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSuccess}
          className="btn-outline"
        >
          Abbrechen
        </button>
      </div>

      {formData.generatePassword && (
        <div className="alert-info">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Info zum temporären Passwort:</p>
            <p className="text-sm mt-1">
              Ein sicheres temporäres Passwort wird automatisch generiert. Nach der Erstellung können Sie eine PDF 
              mit den Zugangsdaten herunterladen, die Sie dem Benutzer zur Verfügung stellen können.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}