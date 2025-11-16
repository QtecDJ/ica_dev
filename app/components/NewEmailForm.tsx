"use client";

import { useState, useEffect } from "react";
import { Send, User, Mail, MessageSquare, Check, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import MentionInput from "./MentionInput";

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
  const { data: session } = useSession();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [subjectText, setSubjectText] = useState("");

  const [formData, setFormData] = useState({
    recipient_id: searchParams.get("recipient") || "",
    subject: searchParams.get("subject") || "",
    body: "",
  });

  // Prüfe ob User Coach/Admin/Manager ist (für @mention System)
  const userRole = session?.user?.role;
  const isCoachOrAdmin = userRole === "coach" || userRole === "admin" || userRole === "manager";

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

    // Validierung - für @mention System nutzen wir recipientId state
    const finalRecipientId = isCoachOrAdmin ? recipientId : parseInt(formData.recipient_id);
    const finalSubject = isCoachOrAdmin ? subjectText : formData.subject;

    if (!finalRecipientId || !finalSubject || !formData.body) {
      setError("Bitte fülle alle Felder aus und wähle einen Empfänger mit @ aus!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: finalRecipientId,
          subject: finalSubject,
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

        {/* Empfänger - Unterschiedlich je nach Rolle */}
        {!isCoachOrAdmin ? (
          // Members & Parents: Dropdown mit nur Coaches/Trainers
          <div>
            <label className="label flex items-center gap-2">
              <User className="w-4 h-4" />
              Empfänger (Trainer/Coach) *
            </label>
            <select
              value={formData.recipient_id}
              onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
              className="input"
              required
              disabled={loading || success}
            >
              <option value="">-- Trainer/Coach auswählen --</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} {contact.team_name ? `(${contact.team_name})` : ""} - {contact.role}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Wähle einen Trainer oder Coach aus deinem Team
            </p>
          </div>
        ) : (
          // Coaches/Admins/Managers: @mention System für Betreff
          <div>
            <label className="label flex items-center gap-2">
              <User className="w-4 h-4" />
              Empfänger (mit @erwähnen) *
            </label>
            <MentionInput
              contacts={contacts}
              value={subjectText}
              onChange={setSubjectText}
              onSelectRecipient={setRecipientId}
              disabled={loading || success}
              placeholder="Beginne mit @benutzername um einen Empfänger auszuwählen..."
            />
            {recipientId && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Empfänger ausgewählt: {contacts.find(c => c.id === recipientId)?.name}
              </div>
            )}
          </div>
        )}

        {/* Betreff - nur für Members/Parents, Coaches nutzen Betreff-Feld als @mention */}
        {!isCoachOrAdmin && (
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
        )}

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
