"use client";

import { useState } from "react";
import { updateAttendanceStatus } from "../actions";
import { CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

type AttendanceButtonsProps = {
  trainingId: number;
  memberId: number;
  currentStatus?: "accepted" | "declined" | "pending";
  currentComment?: string;
};

export default function AttendanceButtons({
  trainingId,
  memberId,
  currentStatus,
  currentComment,
}: AttendanceButtonsProps) {
  const [status, setStatus] = useState(currentStatus || "pending");
  const [comment, setComment] = useState(currentComment || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStatusChange(newStatus: "accepted" | "declined" | "pending") {
    setIsLoading(true);
    const result = await updateAttendanceStatus(
      trainingId,
      memberId,
      newStatus,
      comment
    );
    if (result.success) {
      setStatus(newStatus);
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
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
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
  );
}
