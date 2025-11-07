"use client";

import { useState, useEffect } from "react";
import { Send, User, Mail, MessageSquare, Check, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Contact {
  id: number;
  name: string;
  email: string | null;
  role: string;
  contact_type?: string;
  team_name?: string;
}

export default function NewEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    recipient_id: searchParams.get("recipient") || "",
    subject: searchParams.get("subject") || "",
    body: "",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/emails/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validierung
    if (!formData.recipient_id || !formData.subject || !formData.body) {
      setError("Bitte fülle alle Felder aus!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: parseInt(formData.recipient_id),
          subject: formData.subject,
          body: formData.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Senden");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/emails?folder=sent");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      manager: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      coach: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      parent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      member: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[role] || "bg-gray-100"}`}>{role}</span>;
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="card-body space-y-6">
        {error && (
          <div className="alert-error flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert-success flex items-center gap-2">
            <Check className="w-4 h-4" />
            Nachricht erfolgreich gesendet! Weiterleitung...
          </div>
        )}

        {/* Empfänger */}
        <div>
          <label className="label flex items-center gap-2">
            <User className="w-4 h-4" />
            Empfänger *
          </label>
          <select
            value={formData.recipient_id}
            onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
            className="input"
            required
            disabled={loading || success}
          >
            <option value="">-- Empfänger auswählen --</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name} {contact.team_name ? `(${contact.team_name})` : ""} - {contact.role}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Wähle einen Empfänger für deine Nachricht
          </p>
        </div>

        {/* Betreff */}
        <div>
          <label className="label flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Betreff *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="input"
            placeholder="z.B. Frage zu Training am Samstag"
            required
            maxLength={200}
            disabled={loading || success}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maximal 200 Zeichen
          </p>
        </div>

        {/* Nachricht */}
        <div>
          <label className="label flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Nachricht *
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="input min-h-[200px]"
            placeholder="Deine Nachricht hier..."
            required
            disabled={loading || success}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schreibe deine Nachricht
          </p>
        </div>

        {/* Buttons */}
        <div className="card-footer flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading || success}
            className="btn-secondary flex-1"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary flex-1"
          >
            <Send className="w-4 h-4" />
            {loading ? "Wird gesendet..." : "Senden"}
          </button>
        </div>
      </form>
    </div>
  );
}
