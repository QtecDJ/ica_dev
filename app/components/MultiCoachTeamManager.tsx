"use client";

import { useState, useEffect } from "react";
import { Users, Plus, X, Star, UserCheck, Save, AlertCircle } from "lucide-react";

interface Coach {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TeamCoach {
  coach_id: number;
  coach_name: string;
  coach_email: string;
  coach_role: string;
  is_primary: boolean;
}

interface Team {
  id: number;
  name: string;
  level: string;
  coaches: TeamCoach[];
}

interface MultiCoachTeamManagerProps {
  team: Team;
  availableCoaches: Coach[];
  onUpdate: (teamId: number, coaches: TeamCoach[]) => void;
}

export default function MultiCoachTeamManager({
  team,
  availableCoaches,
  onUpdate,
}: MultiCoachTeamManagerProps) {
  const [coaches, setCoaches] = useState<TeamCoach[]>(team.coaches || []);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("coach");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Verfügbare Coaches (nur die, die noch nicht zugewiesen sind)
  const unassignedCoaches = availableCoaches.filter(
    coach => !coaches.some(tc => tc.coach_id === coach.id)
  );

  const addCoach = () => {
    if (!selectedCoachId) return;

    const coach = availableCoaches.find(c => c.id === selectedCoachId);
    if (!coach) return;

    const newCoach: TeamCoach = {
      coach_id: coach.id,
      coach_name: coach.name,
      coach_email: coach.email,
      coach_role: selectedRole,
      is_primary: coaches.length === 0, // Erster Coach wird automatisch primary
    };

    setCoaches(prev => [...prev, newCoach]);
    setSelectedCoachId(null);
    setSelectedRole("coach");
    setMessage({ type: 'success', text: `${coach.name} wurde hinzugefügt` });
  };

  const removeCoach = (coachId: number) => {
    const coachToRemove = coaches.find(c => c.coach_id === coachId);
    if (!coachToRemove) return;

    setCoaches(prev => {
      const updated = prev.filter(c => c.coach_id !== coachId);
      
      // Wenn der primäre Coach entfernt wird, den ersten verfügbaren Coach als primär setzen
      if (coachToRemove.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      
      return updated;
    });
    
    setMessage({ type: 'success', text: `${coachToRemove.coach_name} wurde entfernt` });
  };

  const setPrimaryCoach = (coachId: number) => {
    setCoaches(prev =>
      prev.map(coach => ({
        ...coach,
        is_primary: coach.coach_id === coachId,
      }))
    );
    
    const coach = coaches.find(c => c.coach_id === coachId);
    setMessage({ type: 'success', text: `${coach?.coach_name} ist jetzt der Haupt-Coach` });
  };

  const updateCoachRole = (coachId: number, newRole: string) => {
    setCoaches(prev =>
      prev.map(coach =>
        coach.coach_id === coachId
          ? { ...coach, coach_role: newRole }
          : coach
      )
    );
  };

  const saveChanges = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await onUpdate(team.id, coaches);
      setMessage({ type: 'success', text: 'Coach-Zuweisungen wurden gespeichert' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Änderungen' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const coachRoleOptions = [
    { value: 'head_coach', label: '👑 Haupt-Coach', description: 'Verantwortlich für das gesamte Team' },
    { value: 'assistant_coach', label: '🤝 Assistent-Coach', description: 'Unterstützt den Haupt-Coach' },
    { value: 'coach', label: '🏋️ Coach', description: 'Allgemeiner Coach' },
    { value: 'substitute_coach', label: '🔄 Ersatz-Coach', description: 'Springt bei Bedarf ein' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Coach-Verwaltung
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Team: {team.name} ({team.level})
          </p>
        </div>
        
        {coaches.length > 0 && (
          <button
            onClick={saveChanges}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Speichern
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
            : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
        }`}>
          {message.type === 'success' ? (
            <UserCheck className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Current Coaches */}
      {coaches.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h4 className="font-semibold">Zugewiesene Coaches ({coaches.length})</h4>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {coaches.map((coach) => (
              <div key={coach.coach_id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    coach.is_primary 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {coach.is_primary && <Star className="w-5 h-5" />}
                    {!coach.is_primary && coach.coach_name.slice(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-slate-900 dark:text-slate-50">
                        {coach.coach_name}
                      </h5>
                      {coach.is_primary && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full dark:bg-yellow-900/30 dark:text-yellow-300">
                          Haupt-Coach
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {coach.coach_email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Selector */}
                    <select
                      value={coach.coach_role}
                      onChange={(e) => updateCoachRole(coach.coach_id, e.target.value)}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800"
                    >
                      {coachRoleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Primary Button */}
                    {!coach.is_primary && (
                      <button
                        onClick={() => setPrimaryCoach(coach.coach_id)}
                        className="btn-outline text-xs text-yellow-600 hover:text-yellow-700 hover:border-yellow-300"
                        title="Als Haupt-Coach setzen"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeCoach(coach.coach_id)}
                      className="btn-outline text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                      title="Coach entfernen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Coach */}
      {unassignedCoaches.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h4 className="font-semibold">Coach hinzufügen</h4>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Coach auswählen</label>
                <select
                  value={selectedCoachId || ""}
                  onChange={(e) => setSelectedCoachId(parseInt(e.target.value))}
                  className="input"
                >
                  <option value="">Bitte wählen...</option>
                  {unassignedCoaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name} ({coach.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Rolle</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input"
                >
                  {coachRoleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {coachRoleOptions.find(opt => opt.value === selectedRole)?.description}
                </p>
              </div>

              <div className="flex items-end">
                <button
                  onClick={addCoach}
                  disabled={!selectedCoachId}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Coaches Message */}
      {coaches.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Keine Coaches zugewiesen
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Weise diesem Team einen oder mehrere Coaches zu, um die Verwaltung zu ermöglichen.
            </p>
            {unassignedCoaches.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Keine verfügbaren Coaches gefunden. Erstelle zuerst Coach-Benutzer in der Benutzerverwaltung.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Multi-Coach-System
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• Teams können mehrere Coaches haben</p>
          <p>• Ein Haupt-Coach (Primary) ist für Rückwärtskompatibilität erforderlich</p>
          <p>• Alle Coaches können mit Eltern des Teams kommunizieren</p>
          <p>• Coaches sehen nur Teams, denen sie zugewiesen sind</p>
        </div>
      </div>
    </div>
  );
}