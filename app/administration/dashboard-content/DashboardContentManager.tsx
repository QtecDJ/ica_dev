"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Video,
  Bell,
  AlertTriangle,
  Info,
  Heart,
  ArrowUp,
  ArrowDown,
  Calendar,
  Users,
  User,
  Briefcase,
  UserCog,
} from "lucide-react";

interface DashboardContent {
  id: number;
  content_type: string;
  title: string;
  content: string;
  is_active: boolean;
  target_role: string | null;
  priority: number;
  livestream_url: string | null;
  livestream_platform: string | null;
  event_date: string | null;
  expires_at: string | null;
  background_color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  updated_by_name: string | null;
}

interface Props {
  contents: DashboardContent[];
  userId: string;
}

export default function DashboardContentManager({ contents, userId }: Props) {
  const [items, setItems] = useState<DashboardContent[]>(contents);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    content_type: "welcome",
    title: "",
    content: "",
    is_active: true,
    target_role: null as string | null,
    priority: 100,
    livestream_url: "",
    livestream_platform: "youtube",
    event_date: "",
    expires_at: "",
    background_color: "default",
    icon: "Heart",
  });

  const resetForm = () => {
    setFormData({
      content_type: "welcome",
      title: "",
      content: "",
      is_active: true,
      target_role: null,
      priority: 100,
      livestream_url: "",
      livestream_platform: "youtube",
      event_date: "",
      expires_at: "",
      background_color: "default",
      icon: "Heart",
    });
    setEditingId(null);
    setShowNewForm(false);
  };

  const handleEdit = (item: DashboardContent) => {
    setFormData({
      content_type: item.content_type,
      title: item.title,
      content: item.content,
      is_active: item.is_active,
      target_role: item.target_role,
      priority: item.priority,
      livestream_url: item.livestream_url || "",
      livestream_platform: item.livestream_platform || "youtube",
      event_date: item.event_date ? new Date(item.event_date).toISOString().slice(0, 16) : "",
      expires_at: item.expires_at ? new Date(item.expires_at).toISOString().slice(0, 16) : "",
      background_color: item.background_color,
      icon: item.icon || "Heart",
    });
    setEditingId(item.id);
    setShowNewForm(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const endpoint = editingId
        ? `/api/admin/dashboard-content/${editingId}`
        : "/api/admin/dashboard-content";

      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          event_date: formData.event_date || null,
          expires_at: formData.expires_at || null,
          livestream_url: formData.livestream_url || null,
          user_id: userId,
        }),
      });

      if (!response.ok) throw new Error("Fehler beim Speichern");

      // Refresh page data
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchtest du diesen Inhalt wirklich löschen?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard-content/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Fehler beim Löschen");

      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Löschen");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard-content/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error("Fehler beim Aktualisieren");

      setItems(
        items.map((item) =>
          item.id === id ? { ...item, is_active: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Fehler beim Aktualisieren");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "livestream":
        return <Video className="w-5 h-5" />;
      case "announcement":
        return <Bell className="w-5 h-5" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "parent":
        return <Users className="w-4 h-4" />;
      case "member":
        return <User className="w-4 h-4" />;
      case "coach":
        return <Briefcase className="w-4 h-4" />;
      case "admin":
        return <UserCog className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      default: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
      blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    };
    return colors[color] || colors.default;
  };

  return (
    <div className="space-y-6">
      {/* New Content Button */}
      {!showNewForm && !editingId && (
        <button
          onClick={() => setShowNewForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neuen Inhalt erstellen
        </button>
      )}

      {/* Edit/New Form */}
      {(showNewForm || editingId) && (
        <div className="card border-2 border-red-500">
          <div className="card-header bg-red-50 dark:bg-red-900/20">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingId ? "Inhalt bearbeiten" : "Neuen Inhalt erstellen"}
            </h3>
          </div>
          <div className="card-body space-y-4">
            {/* Content Type */}
            <div>
              <label className="label">Content-Typ *</label>
              <select
                value={formData.content_type}
                onChange={(e) =>
                  setFormData({ ...formData, content_type: e.target.value })
                }
                className="input"
              >
                <option value="welcome">Willkommen</option>
                <option value="announcement">Ankündigung</option>
                <option value="livestream">Livestream</option>
                <option value="alert">Alert</option>
                <option value="info">Information</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="label">Titel *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="z.B. Herzlich willkommen!"
                className="input"
              />
            </div>

            {/* Content (Rich Text Area) */}
            <div>
              <label className="label">Inhalt (HTML unterstützt) *</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="HTML-Content mit <p>, <ul>, <strong>, etc."
                rows={8}
                className="input font-mono text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                💡 HTML-Tags: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, etc.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Role */}
              <div>
                <label className="label">Zielgruppe</label>
                <select
                  value={formData.target_role || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_role: e.target.value || null,
                    })
                  }
                  className="input"
                >
                  <option value="">Alle</option>
                  <option value="parent">Eltern</option>
                  <option value="member">Mitglieder</option>
                  <option value="coach">Coaches</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="label">Priorität (Sortierung)</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="input"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Höhere Werte = weiter oben
                </p>
              </div>

              {/* Background Color */}
              <div>
                <label className="label">Hintergrundfarbe</label>
                <select
                  value={formData.background_color}
                  onChange={(e) =>
                    setFormData({ ...formData, background_color: e.target.value })
                  }
                  className="input"
                >
                  <option value="default">Standard (Grau)</option>
                  <option value="blue">Blau</option>
                  <option value="red">Rot</option>
                  <option value="green">Grün</option>
                  <option value="yellow">Gelb</option>
                  <option value="purple">Lila</option>
                </select>
              </div>

              {/* Icon */}
              <div>
                <label className="label">Icon (Lucide-Name)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="z.B. Heart, Bell, Video"
                  className="input"
                />
              </div>
            </div>

            {/* Livestream Settings (nur bei Livestream-Typ) */}
            {formData.content_type === "livestream" && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                  Livestream-Einstellungen
                </h4>
                
                <div>
                  <label className="label">Livestream-URL (Embed)</label>
                  <input
                    type="url"
                    value={formData.livestream_url}
                    onChange={(e) =>
                      setFormData({ ...formData, livestream_url: e.target.value })
                    }
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    className="input"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    YouTube: https://www.youtube.com/embed/VIDEO_ID<br />
                    Twitch: https://player.twitch.tv/?channel=CHANNEL&parent=DOMAIN
                  </p>
                </div>

                <div>
                  <label className="label">Platform</label>
                  <select
                    value={formData.livestream_platform}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        livestream_platform: e.target.value,
                      })
                    }
                    className="input"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="twitch">Twitch</option>
                    <option value="vimeo">Vimeo</option>
                  </select>
                </div>

                <div>
                  <label className="label">Event-Datum (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>
            )}

            {/* Expiration Date */}
            <div>
              <label className="label">
                Ablaufdatum (optional - automatische Deaktivierung)
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({ ...formData, expires_at: e.target.value })
                }
                className="input"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="label !mb-0">
                Sofort aktivieren
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={loading || !formData.title || !formData.content}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Speichert..." : "Speichern"}
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`card border-2 ${
              item.is_active ? "border-green-200 dark:border-green-800" : "border-slate-200 dark:border-slate-700 opacity-60"
            }`}
          >
            <div className="card-body">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(
                      item.background_color
                    )}`}
                  >
                    {getTypeIcon(item.content_type)}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                        {item.title}
                      </h3>
                      {item.target_role && (
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded flex items-center gap-1">
                          {getRoleIcon(item.target_role)}
                          {item.target_role}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        Priorität: {item.priority}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div
                      className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Typ: {item.content_type}</span>
                      {item.livestream_url && (
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Livestream
                        </span>
                      )}
                      {item.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.event_date).toLocaleDateString("de-DE")}
                        </span>
                      )}
                      {item.expires_at && (
                        <span className="text-orange-600 dark:text-orange-400">
                          Läuft ab: {new Date(item.expires_at).toLocaleDateString("de-DE")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    disabled={loading}
                    className={`p-2 rounded-lg ${
                      item.is_active
                        ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    title={item.is_active ? "Deaktivieren" : "Aktivieren"}
                  >
                    {item.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="Bearbeiten"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-12">
              <Info className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                Noch keine Dashboard-Inhalte erstellt
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
