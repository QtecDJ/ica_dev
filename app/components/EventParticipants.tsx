"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Clock, User } from "lucide-react";

interface Participant {
  id: number;
  event_id: number;
  member_id: number;
  status: 'pending' | 'accepted' | 'declined';
  notes: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  team_name: string | null;
}

export default function EventParticipants({ 
  eventId, 
  participants, 
  userRole,
  userId 
}: { 
  eventId: number;
  participants: Participant[];
  userRole?: string;
  userId?: string;
}) {
  const [participantList, setParticipantList] = useState<Participant[]>(participants);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Finde Member-ID des aktuellen Benutzers
  const currentUserMemberId = participantList.find((p) => {
    // TODO: Diese Logik muss erweitert werden um user_id zu member_id zu matchen
    // Für jetzt nur als Platzhalter
    return false;
  })?.member_id;

  const handleStatusChange = async (participantId: number, newStatus: 'pending' | 'accepted' | 'declined') => {
    setLoading(participantId);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          participantId,
          status: newStatus 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Aktualisieren");
      }

      // Update lokal
      setParticipantList(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, status: newStatus }
            : p
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="badge badge-green flex items-center gap-1">
            <Check className="w-3 h-3" />
            Zugesagt
          </span>
        );
      case 'declined':
        return (
          <span className="badge badge-red flex items-center gap-1">
            <X className="w-3 h-3" />
            Abgesagt
          </span>
        );
      default:
        return (
          <span className="badge badge-gray flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ausstehend
          </span>
        );
    }
  };

  const canChangeStatus = (participant: Participant) => {
    // Admins und Coaches können jeden Status ändern
    if (userRole === 'admin' || userRole === 'coach') return true;
    
    // Member können nur ihren eigenen Status ändern
    if (userRole === 'member' && participant.member_id === currentUserMemberId) return true;
    
    return false;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Teilnehmer ({participantList.length})
        </h2>
      </div>

      {error && (
        <div className="mx-6 mt-6">
          <div className="alert alert-error">{error}</div>
        </div>
      )}

      <div className="card-body">
        <div className="space-y-3">
          {participantList.map((participant) => (
            <div
              key={participant.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Teilnehmer Info */}
              <Link
                href={`/members/${participant.member_id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {participant.avatar_url ? (
                    <Image
                      src={participant.avatar_url}
                      alt={`${participant.first_name} ${participant.last_name}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    {participant.first_name} {participant.last_name}
                  </p>
                  {participant.team_name && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {participant.team_name}
                    </p>
                  )}
                </div>
              </Link>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 sm:pl-4">
                {getStatusBadge(participant.status)}
                
                {canChangeStatus(participant) && participant.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(participant.id, 'accepted')}
                      disabled={loading === participant.id}
                      className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                      title="Zusagen"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(participant.id, 'declined')}
                      disabled={loading === participant.id}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      title="Absagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {canChangeStatus(participant) && participant.status !== 'pending' && (
                  <button
                    onClick={() => handleStatusChange(participant.id, 'pending')}
                    disabled={loading === participant.id}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors disabled:opacity-50"
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {participantList.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              Noch keine Teilnehmer angemeldet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
