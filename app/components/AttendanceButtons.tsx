"use client";

import { useState } from "react";
import { updateAttendanceStatus } from "../actions";
import { CheckCircle, XCircle, Clock, MessageSquare, AlertCircle } from "lucide-react";

type AttendanceButtonsProps = {
  trainingId: number;
  memberId: number;
  currentStatus?: "accepted" | "declined" | "pending";
  currentComment?: string;
  currentDeclineReason?: string;
};

export default function AttendanceButtons({
  trainingId,
  memberId,
  currentStatus,
  currentComment,
  currentDeclineReason,
}: AttendanceButtonsProps) {
  const [status, setStatus] = useState(currentStatus || "pending");
  const [comment, setComment] = useState(currentComment || "");
  const [declineReason, setDeclineReason] = useState(currentDeclineReason || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: "accepted" | "declined" | "pending") {
    // If declining, show dialog for reason
    if (newStatus === "declined") {
      setShowDeclineDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await updateAttendanceStatus(
      trainingId,
      memberId,
      newStatus,
      comment
    );
    if (result.success) {
      setStatus(newStatus);
    } else {
      setError(result.error || "Fehler beim Aktualisieren");
    }
    setIsLoading(false);
  }

  async function handleDeclineWithReason() {
    if (!declineReason.trim()) {
      setError("Bitte gib einen Grund für die Absage an");
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await updateAttendanceStatus(
      trainingId,
      memberId,
      "declined",
      comment,
      declineReason
    );
    if (result.success) {
      setStatus("declined");
      setShowDeclineDialog(false);
    } else {
      setError(result.error || "Fehler beim Aktualisieren");
    }
    setIsLoading(false);
  }

  async function handleCommentSubmit() {
    setIsLoading(true);
    await updateAttendanceStatus(trainingId, memberId, status, comment);
    setIsLoading(false);
    setIsEditing(false);
  }

  return (
    <>
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Teilnahme:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange("accepted")}
              disabled={isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === "accepted"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
              } disabled:opacity-50`}
            >
              <CheckCircle className="w-4 h-4" />
              Zusagen
            </button>
            <button
              onClick={() => handleStatusChange("declined")}
              disabled={isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === "declined"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
              } disabled:opacity-50`}
            >
              <XCircle className="w-4 h-4" />
              Absagen
            </button>
            <button
              onClick={() => handleStatusChange("pending")}
              disabled={isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
              } disabled:opacity-50`}
            >
              <Clock className="w-4 h-4" />
              Ausstehend
            </button>
          </div>
        </div>

        {/* Show decline reason if status is declined */}
        {status === "declined" && declineReason && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900 mb-1">Absage-Grund:</p>
            <p className="text-sm text-red-700">{declineReason}</p>
          </div>
        )}

      {/* Comment Section */}
      <div className="mt-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {comment || isEditing ? "Kommentar bearbeiten" : "Kommentar hinzufügen"}
        </button>

        {isEditing && (
          <div className="mt-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Füge einen Kommentar hinzu..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all text-sm"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCommentSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setComment(currentComment || "");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {comment && !isEditing && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{comment}</p>
          </div>
        )}
      </div>
    </div>

    {/* Decline Reason Dialog */}
    {showDeclineDialog && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Grund für Absage</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Bitte gib einen Grund für deine Absage an. Dies hilft dem Coach, besser zu planen.
          </p>

          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="z.B. Krankheit, Familiäre Verpflichtungen, Anderer Termin..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all text-sm"
            rows={4}
            autoFocus
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDeclineWithReason}
              disabled={isLoading || !declineReason.trim()}
              className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Wird gespeichert..." : "Absage bestätigen"}
            </button>
            <button
              onClick={() => {
                setShowDeclineDialog(false);
                setDeclineReason(currentDeclineReason || "");
                setError(null);
              }}
              disabled={isLoading}
              className="px-4 py-3 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
