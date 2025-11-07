"use client";

import { useState, useEffect } from "react";
import { Inbox, Send, Star, Trash2, Mail, MailOpen, RefreshCw, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Email {
  id: number;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  sent_at: string;
  read_at: string | null;
  sender_id?: number;
  sender_name?: string;
  sender_email?: string;
  sender_role?: string;
  recipient_id?: number;
  recipient_name?: string;
  recipient_email?: string;
  recipient_role?: string;
}

type FolderType = "inbox" | "sent" | "starred" | "trash";

export default function EmailsClient() {
  const router = useRouter();
  const [activeFolder, setActiveFolder] = useState<FolderType>("inbox");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    fetchEmails();
  }, [activeFolder]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/emails?folder=${activeFolder}`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async (emailId: number, action: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchEmails();
        if (action === "delete") {
          setSelectedEmail(null);
        }
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const openEmail = async (email: Email) => {
    setSelectedEmail(email);

    // Mark as read wenn ungelesen
    if (!email.is_read && email.recipient_id) {
      await handleEmailAction(email.id, "mark_read");
    }
  };

  const folders = [
    { id: "inbox" as FolderType, label: "Posteingang", icon: Inbox, count: emails.filter(e => !e.is_read).length },
    { id: "sent" as FolderType, label: "Gesendet", icon: Send, count: 0 },
    { id: "starred" as FolderType, label: "Markiert", icon: Star, count: 0 },
    { id: "trash" as FolderType, label: "Papierkorb", icon: Trash2, count: 0 },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("de-DE", { weekday: "short" });
    } else {
      return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
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
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar - Folders */}
      <div className="col-span-12 lg:col-span-3">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Ordner</h2>
          </div>
          <div className="card-body p-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeFolder === folder.id
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <folder.icon className="w-5 h-5" />
                  <span className="font-medium">{folder.label}</span>
                </div>
                {activeFolder === folder.id && folder.id === "inbox" && folder.count > 0 && (
                  <span className="badge badge-red">{folder.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="col-span-12 lg:col-span-9">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {folders.find(f => f.id === activeFolder)?.label}
            </h2>
            <button onClick={fetchEmails} className="btn-ghost !p-2">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Lade Nachrichten...
              </div>
            ) : emails.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Keine Nachrichten in diesem Ordner</p>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => openEmail(email)}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                    !email.is_read && activeFolder === "inbox" ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  } ${selectedEmail?.id === email.id ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-1">
                      {email.is_read || activeFolder === "sent" ? (
                        <MailOpen className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold truncate ${!email.is_read && activeFolder === "inbox" ? "text-slate-900 dark:text-slate-50" : "text-slate-700 dark:text-slate-300"}`}>
                              {activeFolder === "sent" ? email.recipient_name : email.sender_name}
                            </p>
                            {activeFolder === "inbox" && getRoleBadge(email.sender_role)}
                            {activeFolder === "sent" && getRoleBadge(email.recipient_role)}
                          </div>
                          <p className={`text-sm truncate ${!email.is_read && activeFolder === "inbox" ? "font-medium text-slate-900 dark:text-slate-50" : "text-slate-600 dark:text-slate-400"}`}>
                            {email.subject}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-500 truncate mt-1">
                            {email.body.substring(0, 80)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {email.is_starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(email.sent_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmail(null)}>
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="card-header flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold">{selectedEmail.subject}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEmailAction(selectedEmail.id, "star")}
                  className="btn-ghost !p-2"
                >
                  <Star className={`w-4 h-4 ${selectedEmail.is_starred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                </button>
                <button
                  onClick={() => handleEmailAction(selectedEmail.id, "delete")}
                  className="btn-ghost !p-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedEmail(null)} className="btn-ghost !p-2">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {/* Sender Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {(activeFolder === "sent" ? selectedEmail.recipient_name : selectedEmail.sender_name)?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {activeFolder === "sent" ? selectedEmail.recipient_name : selectedEmail.sender_name}
                    </p>
                    {getRoleBadge(activeFolder === "sent" ? selectedEmail.recipient_role : selectedEmail.sender_role)}
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(selectedEmail.sent_at).toLocaleString("de-DE")}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="py-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {selectedEmail.body}
              </div>

              {/* Actions */}
              {activeFolder === "inbox" && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href={`/emails/new?recipient=${selectedEmail.sender_id}&subject=Re: ${selectedEmail.subject}`}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                    Antworten
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
