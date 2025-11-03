"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  IconSend, 
  IconArrowLeft, 
  IconUser, 
  IconClock, 
  IconMessageCircle, 
  IconMail, 
  IconTrash, 
  IconCheck, 
  IconDotsVertical 
} from "@tabler/icons-react";
import Link from "next/link";



interface Conversation {
  partner_id: number;
  partner_name: string;
  partner_role: string;
  message_count: number;
  unread_count: number;
  last_message_date: string;
  last_message_content?: string;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_role: string;
}

interface Coach {
  id: number;
  name: string;
  email: string;
  team_name?: string;
  contact_type?: string;
}

interface MessagesClientProps {
  initialConversations: Conversation[];
  availableCoaches: Coach[];
  availableParents: Coach[];
  userRole: string;
  userId: number;
}

export default function MessagesClient({
  initialConversations,
  availableCoaches,
  availableParents,
  userRole,
  userId,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Auto-scroll zu neuen Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Berechne total unread count
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
    setTotalUnread(total);
  }, [conversations]);

  // Polling für neue Nachrichten (alle 10 Sekunden)
  useEffect(() => {
    const pollMessages = async () => {
      try {
        // Lade aktualisierte Konversationsliste
        const response = await fetch("/api/messages");
        if (response.ok) {
          const data = await response.json();
          const newConversations = data.conversations || [];
          
          // Prüfe ob neue ungelesene Nachrichten da sind
          const oldUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
          const newUnread = newConversations.reduce((sum: number, c: Conversation) => sum + c.unread_count, 0);
          
          if (newUnread > oldUnread) {
            // Neue Nachricht! - Zeige Browser-Benachrichtigung
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Neue Nachricht", {
                body: "Du hast eine neue Nachricht erhalten",
                icon: "/icons/icon-192x192.png"
              });
            }
          }
          
          setConversations(newConversations);
          
          // Wenn aktuell eine Konversation geöffnet ist, lade neue Nachrichten
          if (selectedPartnerId) {
            const convResponse = await fetch(`/api/messages/${selectedPartnerId}`);
            if (convResponse.ok) {
              const convData = await convResponse.json();
              const newMessages = convData.messages || [];
              
              // Nur updaten wenn neue Nachrichten da sind
              if (newMessages.length !== messages.length) {
                setMessages(newMessages);
              }
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Starte Polling
    pollingIntervalRef.current = setInterval(pollMessages, 10000); // Alle 10 Sekunden

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversations, messages, selectedPartnerId]);

  // Request notification permission beim Mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Lade Konversation
  const loadConversation = async (partnerId: number) => {
    setIsLoading(true);
    setSelectedPartnerId(partnerId);
    setShowNewMessageForm(false);

    try {
      const response = await fetch(`/api/messages/${partnerId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
        // Aktualisiere unread count
        setConversations(prev =>
          prev.map(conv =>
            conv.partner_id === partnerId
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sende Nachricht
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedPartnerId) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedPartnerId,
          content: newMessage,
          subject: subject || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage("");
        setSubject("");
        // Lade Konversation neu
        await loadConversation(selectedPartnerId);
        router.refresh();
      } else {
        alert(data.error || "Fehler beim Senden");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Fehler beim Senden der Nachricht");
    } finally {
      setIsSending(false);
    }
  };

  // Neue Konversation starten
  const startNewConversation = () => {
    setShowNewMessageForm(true);
    setSelectedPartnerId(null);
    setMessages([]);
    setSubject("");
    setNewMessage("");
    
    // Wenn nur ein Coach verfügbar ist, automatisch auswählen
    if (availableCoaches.length === 1) {
      setSelectedCoach(availableCoaches[0].id);
    } else {
      setSelectedCoach(null);
    }
  };

  // Nachricht an ausgewählten Coach senden
  const sendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedCoach) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedCoach,
          content: newMessage,
          subject: subject || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage("");
        setSubject("");
        setSelectedCoach(null);
        setShowNewMessageForm(false);
        router.refresh();
        // Lade die neue Konversation
        await loadConversation(selectedCoach);
      } else {
        alert(data.error || "Fehler beim Senden");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Fehler beim Senden der Nachricht");
    } finally {
      setIsSending(false);
    }
  };

  // Gesamte Konversation löschen
  const deleteConversation = async (partnerId: number) => {
    if (!confirm('Möchtest du diese gesamte Konversation wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/messages/conversations/${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Zurück zur Konversationsliste
        setSelectedPartnerId(null);
        setMessages([]);
        // Entferne die Konversation aus der lokalen Liste
        setConversations(prev => prev.filter(conv => conv.partner_id !== partnerId));
        router.refresh();
      } else {
        const error = await response.json();
        alert('Fehler beim Löschen: ' + (error.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Fehler beim Löschen der Konversation');
    }
  };

  // Gesamte Konversation als erledigt markieren
  const markConversationAsCompleted = async (partnerId: number) => {
    if (!confirm('Möchtest du diese gesamte Konversation als erledigt markieren?')) return;

    try {
      const response = await fetch(`/api/messages/conversations/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_completed' })
      });

      if (response.ok) {
        // Lade die Konversation neu
        if (selectedPartnerId) {
          await loadConversation(selectedPartnerId);
        }
        router.refresh();
      } else {
        const error = await response.json();
        alert('Fehler: ' + (error.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error marking conversation as completed:', error);
      alert('Fehler beim Markieren der Konversation');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Gestern";
    } else {
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return (
    <div className={`${(userRole === "parent" || userRole === "member") ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}`}>
      {/* Konversationen-Liste - versteckt wenn Chat offen (für Parents/Members) */}
      <div className={`${
        (userRole === "parent" || userRole === "member") 
          ? (selectedPartnerId || showNewMessageForm ? "hidden" : "block")
          : "lg:col-span-1"
      }`}>
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">
              {(userRole === "parent" || userRole === "member") ? "Deine Nachrichten" : "Konversationen"}
            </h2>
          </div>
          
          {/* Prominenter "Coach schreiben" Button für Parents/Members */}
          {(userRole === "parent" || userRole === "member") && availableCoaches.length > 0 && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={startNewConversation}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <IconSend className="w-5 h-5" stroke={2} />
                <span className="font-semibold">Nachricht schreiben</span>
              </button>
              {availableCoaches.length === 1 && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                  💬 Dein Coach: {availableCoaches[0].name}
                </p>
              )}
            </div>
          )}
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <IconMessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" stroke={2} />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Noch keine Nachrichten
                </p>
                {(userRole === "parent" || userRole === "member") && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Klicke oben auf den Button um eine Nachricht zu senden
                  </p>
                )}
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partner_id}
                  onClick={() => loadConversation(conv.partner_id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    selectedPartnerId === conv.partner_id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(conv.partner_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {conv.partner_name}
                        </h3>
                        {conv.unread_count > 0 && (
                          <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 animate-pulse">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {conv.partner_role === "coach" && "🏋️ Coach"}
                        {conv.partner_role === "admin" && "👨‍💼 Admin"}
                        {conv.partner_role === "parent" && "👨‍👩‍👧‍👦 Eltern"}
                      </p>
                      {conv.last_message_content && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {conv.last_message_content}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {formatDate(conv.last_message_date)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Nachrichten-Bereich - Vollbild für Parents/Members */}
      <div className={`${(userRole === "parent" || userRole === "member") ? "block" : "lg:col-span-2"}`}>
        {showNewMessageForm ? (
          /* Neue Nachricht Form */
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewMessageForm(false)}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                >
                  <IconArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">Nachricht schreiben</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Wähle einen Empfänger und stelle deine Frage
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={sendNewMessage} className="card-body space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">
                    An wen möchtest du schreiben? *
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      ({availableCoaches.length} verfügbar)
                    </span>
                  </label>
                  <select
                    value={selectedCoach || ""}
                    onChange={(e) => setSelectedCoach(parseInt(e.target.value))}
                    className="input"
                    required
                  >
                    <option value="">Bitte wählen...</option>
                    
                    {/* Coaches gruppiert anzeigen */}
                    {availableCoaches.filter(coach => coach.contact_type !== 'admin').length > 0 && (
                      <optgroup label="🏋️ Team-Coaches">
                        {availableCoaches
                          .filter(coach => coach.contact_type !== 'admin')
                          .map((coach) => (
                            <option key={coach.id} value={coach.id}>
                              {coach.name} {coach.team_name && `(${coach.team_name})`}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    
                    {/* Admins gruppiert anzeigen */}
                    {availableCoaches.filter(coach => coach.contact_type === 'admin').length > 0 && (
                      <optgroup label="👨‍💼 Administration">
                        {availableCoaches
                          .filter(coach => coach.contact_type === 'admin')
                          .map((coach) => (
                            <option key={coach.id} value={coach.id}>
                              {coach.name} (Administrator)
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Du kannst alle Coaches deines Teams und die Administration kontaktieren
                  </p>
                </div>
              </div>

              <div>
                <label className="label">
                  Betreff (optional)
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    Worum geht es?
                  </span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input"
                  placeholder="z.B. Frage zum Training am Montag"
                />
              </div>

              <div>
                <label className="label">Deine Nachricht *</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input min-h-[200px]"
                  placeholder="Schreibe deine Nachricht hier..."
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dein Coach wird benachrichtigt und kann dir antworten
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewMessageForm(false)}
                  className="btn-secondary flex-1"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSending || !selectedCoach}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <IconSend className="w-4 h-4" />
                      Nachricht senden
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : selectedPartnerId ? (
          /* Konversations-Ansicht */
          <div className="card flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
            <div className="card-header flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPartnerId(null)}
                    className="lg:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  >
                    <IconArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {getInitials(
                      conversations.find((c) => c.partner_id === selectedPartnerId)
                        ?.partner_name || ""
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {conversations.find((c) => c.partner_id === selectedPartnerId)
                        ?.partner_name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {conversations.find((c) => c.partner_id === selectedPartnerId)
                        ?.partner_role === "coach" && "🏋️ Coach"}
                      {conversations.find((c) => c.partner_id === selectedPartnerId)
                        ?.partner_role === "admin" && "👨‍💼 Administrator"}
                      {conversations.find((c) => c.partner_id === selectedPartnerId)
                        ?.partner_role === "parent" && "👨‍👩‍👧‍👦 Eltern"}
                    </p>
                  </div>
                </div>
                
                {/* Konversations-Aktionen */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markConversationAsCompleted(selectedPartnerId)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Konversation als erledigt markieren"
                  >
                    <IconCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteConversation(selectedPartnerId)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Konversation löschen"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Nachrichten */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-500 dark:text-slate-400 mt-3">
                    Lade Nachrichten...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <IconMessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Noch keine Nachrichten
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 relative group ${
                        message.sender_id === userId
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      }`}
                    >

                      
                      {message.subject && (
                        <p className="font-semibold mb-2 text-sm opacity-90">
                          {message.subject}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender_id === userId
                            ? "text-blue-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Nachricht senden */}
            <form
              onSubmit={sendMessage}
              className="card-footer flex-shrink-0 flex gap-3"
            >
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="input flex-1 min-h-[60px] max-h-[120px]"
                placeholder="Nachricht schreiben..."
                rows={2}
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="btn-primary self-end"
              >
                {isSending ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <IconSend className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        ) : !selectedPartnerId && (userRole === "coach" || userRole === "admin") ? (
          /* Keine Konversation ausgewählt - nur für Coaches/Admins */
          <div className="card">
            <div className="card-body text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconMessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">
                  Keine Konversation ausgewählt
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Wähle eine Konversation aus der Liste, um Nachrichten zu sehen
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
