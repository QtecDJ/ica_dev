"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Users, Filter, AlertCircle, Check, BookMarked, Shield } from "lucide-react";

interface Kategorie {
  id: number;
  name: string;
  beschreibung: string;
  icon: string;
  color: string;
  reihenfolge: number;
}

interface Regelwerk {
  id: number;
  titel: string;
  beschreibung: string;
  inhalt: string;
  kategorie_id: number;
  kategorie_name: string;
  kategorie_icon: string;
  kategorie_color: string;
  team_id: number | null;
  team_name: string | null;
  version: string;
  gueltig_ab: string;
  gueltig_bis: string | null;
  ist_aktiv: boolean;
  erstellt_von_name: string;
}

interface Coach {
  id: number;
  name: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  level: string;
}

interface Props {
  initialKategorien: Kategorie[];
  initialRegelwerke: Regelwerk[];
  coaches: Coach[];
  teams: Team[];
}

export default function RegelwerkeAdmin({ initialKategorien, initialRegelwerke, coaches, teams }: Props) {
  const [kategorien, setKategorien] = useState<Kategorie[]>(initialKategorien);
  const [regelwerke, setRegelwerke] = useState<Regelwerk[]>(initialRegelwerke);
  const [selectedKategorie, setSelectedKategorie] = useState<number | null>(null);
  const [showRegelwerkModal, setShowRegelwerkModal] = useState(false);
  const [showZuweisungModal, setShowZuweisungModal] = useState(false);
  const [editingRegelwerk, setEditingRegelwerk] = useState<Regelwerk | null>(null);
  const [selectedRegelwerk, setSelectedRegelwerk] = useState<Regelwerk | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    inhalt: '',
    kategorie_id: '',
    team_id: '',
    version: '1.0'
  });

  const [zuweisungData, setZuweisungData] = useState({
    coach_id: '',
    team_id: ''
  });

  const filteredRegelwerke = selectedKategorie
    ? regelwerke.filter(r => r.kategorie_id === selectedKategorie)
    : regelwerke;

  const handleSaveRegelwerk = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRegelwerk ? '/api/regelwerke' : '/api/regelwerke';
      const method = editingRegelwerk ? 'PUT' : 'POST';
      
      const payload = editingRegelwerk 
        ? { ...formData, id: editingRegelwerk.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');

      const savedRegelwerk = await response.json();
      
      if (editingRegelwerk) {
        setRegelwerke(regelwerke.map(r => r.id === savedRegelwerk.id ? savedRegelwerk : r));
        setMessage({ type: 'success', text: 'Regelwerk erfolgreich aktualisiert' });
      } else {
        setRegelwerke([savedRegelwerk, ...regelwerke]);
        setMessage({ type: 'success', text: 'Regelwerk erfolgreich erstellt' });
      }

      setShowRegelwerkModal(false);
      setEditingRegelwerk(null);
      setFormData({ titel: '', beschreibung: '', inhalt: '', kategorie_id: '', team_id: '', version: '1.0' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Speichern des Regelwerks' });
    }
  };

  const handleDeleteRegelwerk = async (id: number) => {
    if (!confirm('Möchtest du dieses Regelwerk wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/regelwerke?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Fehler beim Löschen');

      setRegelwerke(regelwerke.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'Regelwerk erfolgreich gelöscht' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Löschen des Regelwerks' });
    }
  };

  const handleZuweisung = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRegelwerk || !zuweisungData.coach_id) return;

    try {
      const response = await fetch('/api/regelwerke/zuweisungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regelwerk_id: selectedRegelwerk.id,
          coach_id: parseInt(zuweisungData.coach_id),
          team_id: zuweisungData.team_id ? parseInt(zuweisungData.team_id) : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Zuweisen');
      }

      setMessage({ type: 'success', text: 'Regelwerk erfolgreich zugewiesen' });
      setShowZuweisungModal(false);
      setZuweisungData({ coach_id: '', team_id: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Zuweisen' });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-red-600 dark:text-red-400" />
            Regelwerk-Verwaltung
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verwalte Regelwerke, Kategorien und Coach-Zuweisungen
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRegelwerk(null);
            setFormData({ titel: '', beschreibung: '', inhalt: '', kategorie_id: '', team_id: '', version: '1.0' });
            setShowRegelwerkModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neues Regelwerk
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Kategorie Filter */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">Nach Kategorie filtern</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedKategorie(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedKategorie === null
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Alle ({regelwerke.length})
            </button>
            {kategorien.map(kat => (
              <button
                key={kat.id}
                onClick={() => setSelectedKategorie(kat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedKategorie === kat.id
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={selectedKategorie === kat.id ? { backgroundColor: kat.color } : {}}
              >
                {kat.name} ({regelwerke.filter(r => r.kategorie_id === kat.id).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Regelwerke Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRegelwerke.length === 0 ? (
          <div className="col-span-full card">
            <div className="card-body text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                Keine Regelwerke vorhanden
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Erstelle dein erstes Regelwerk, um loszulegen.
              </p>
            </div>
          </div>
        ) : (
          filteredRegelwerke.map(regelwerk => (
            <div key={regelwerk.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                {/* Header mit Kategorie-Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: regelwerk.kategorie_color }}
                      >
                        {regelwerk.kategorie_name}
                      </span>
                      {regelwerk.team_name && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Team: {regelwerk.team_name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {regelwerk.titel}
                    </h3>
                    {regelwerk.beschreibung && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {regelwerk.beschreibung}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inhalt Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: regelwerk.inhalt }}
                  />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Version {regelwerk.version}</span>
                  <span>von {regelwerk.erstellt_von_name}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRegelwerk(regelwerk);
                      setShowZuweisungModal(true);
                    }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Coaches zuweisen
                  </button>
                  <button
                    onClick={() => {
                      setEditingRegelwerk(regelwerk);
                      setFormData({
                        titel: regelwerk.titel,
                        beschreibung: regelwerk.beschreibung || '',
                        inhalt: regelwerk.inhalt,
                        kategorie_id: regelwerk.kategorie_id.toString(),
                        team_id: regelwerk.team_id?.toString() || '',
                        version: regelwerk.version
                      });
                      setShowRegelwerkModal(true);
                    }}
                    className="btn-icon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRegelwerk(regelwerk.id)}
                    className="btn-icon-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Regelwerk Modal */}
      {showRegelwerkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
                {editingRegelwerk ? 'Regelwerk bearbeiten' : 'Neues Regelwerk erstellen'}
              </h2>

              <form onSubmit={handleSaveRegelwerk} className="space-y-4">
                <div>
                  <label className="label">Titel *</label>
                  <input
                    type="text"
                    value={formData.titel}
                    onChange={e => setFormData({ ...formData, titel: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Beschreibung</label>
                  <input
                    type="text"
                    value={formData.beschreibung}
                    onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Kategorie *</label>
                  <select
                    value={formData.kategorie_id}
                    onChange={e => setFormData({ ...formData, kategorie_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {kategorien.map(kat => (
                      <option key={kat.id} value={kat.id}>{kat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Team (optional)</label>
                  <select
                    value={formData.team_id}
                    onChange={e => setFormData({ ...formData, team_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Alle Teams</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name} ({team.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={e => setFormData({ ...formData, version: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Inhalt * (HTML wird unterstützt)</label>
                  <textarea
                    value={formData.inhalt}
                    onChange={e => setFormData({ ...formData, inhalt: e.target.value })}
                    className="input min-h-[300px] font-mono text-sm"
                    placeholder="Du kannst HTML verwenden: <h3>, <p>, <ul>, <li>, <strong>, <em>, etc."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Tipp: Du kannst HTML-Tags verwenden für bessere Formatierung. 
                    Der Inhalt wird automatisch für Mobile optimiert.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingRegelwerk ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegelwerkModal(false);
                      setEditingRegelwerk(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Zuweisung Modal */}
      {showZuweisungModal && selectedRegelwerk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Coach zuweisen
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedRegelwerk.titel}
              </p>

              <form onSubmit={handleZuweisung} className="space-y-4">
                <div>
                  <label className="label">Coach *</label>
                  <select
                    value={zuweisungData.coach_id}
                    onChange={e => setZuweisungData({ ...zuweisungData, coach_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {coaches.map(coach => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name} ({coach.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Team (optional)</label>
                  <select
                    value={zuweisungData.team_id}
                    onChange={e => setZuweisungData({ ...zuweisungData, team_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Kein spezifisches Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Zuweisen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowZuweisungModal(false);
                      setZuweisungData({ coach_id: '', team_id: '' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
