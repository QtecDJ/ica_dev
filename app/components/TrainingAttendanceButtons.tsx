"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { updateAttendanceStatus } from "@/app/actions";
import { useRouter } from "next/navigation";

interface TrainingAttendanceButtonsProps {
  trainingId: number;
  memberId: number;
  currentStatus: "accepted" | "declined" | "pending";
  currentDeclineReason?: string;
}

export default function TrainingAttendanceButtons({
  trainingId,
  memberId,
  currentStatus,
  currentDeclineReason,
}: TrainingAttendanceButtonsProps) {
  const [status, setStatus] = useState<"accepted" | "declined" | "pending">(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState(currentDeclineReason || "");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (newStatus: "accepted" | "declined") => {
    // If declining, show dialog for reason
    if (newStatus === "declined") {
      setShowDeclineDialog(true);
      return;
    }

    // For accepting, proceed directly
    setStatus(newStatus);
    
    startTransition(async () => {
      const result = await updateAttendanceStatus(trainingId, memberId, newStatus);
      
      if (result.success) {
        router.refresh();
      } else {
        // Revert on error
        setStatus(currentStatus);
        alert(result.error || "Fehler beim Aktualisieren der Teilnahme");
      }
    });
  };

  const handleDeclineWithReason = async () => {
    if (!declineReason.trim()) {
      setError("Bitte gib einen Grund für die Absage an");
      return;
    }

    setStatus("declined");
    setError(null);
    
    startTransition(async () => {
      const result = await updateAttendanceStatus(
        trainingId, 
        memberId, 
        "declined",
        undefined,
        declineReason
      );
      
      if (result.success) {
        setShowDeclineDialog(false);
        router.refresh();
      } else {
        // Revert on error
        setStatus(currentStatus);
        setError(result.error || "Fehler beim Aktualisieren der Teilnahme");
      }
    });
  };

  return (
    <div className="card bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
      <div className="card-body">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Deine Teilnahme
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleStatusChange("accepted")}
            disabled={isPending || status === "accepted"}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              status === "accepted"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-slate-200 dark:border-slate-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPending && status === "accepted" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {status === "accepted" ? "✓ Zugesagt" : "Zusagen"}
          </button>

          <button
            onClick={() => handleStatusChange("declined")}
            disabled={isPending || status === "declined"}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              status === "declined"
                ? "bg-red-600 text-white shadow-lg scale-105"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-slate-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPending && status === "declined" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {status === "declined" ? "✓ Abgesagt" : "Absagen"}
          </button>
        </div>

        {status === "accepted" && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Du hast für dieses Training zugesagt. Bitte sei pünktlich!
            </p>
          </div>
        )}

        {status === "declined" && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              Du hast für dieses Training abgesagt.
            </p>
            {declineReason && (
              <p className="text-sm text-red-700 dark:text-red-300 mt-2 font-medium">
                Grund: {declineReason}
              </p>
            )}
          </div>
        )}

        {status === "pending" && (
          <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              ℹ️ Bitte wähle ob du teilnehmen kannst oder nicht.
            </p>
          </div>
        )}
      </div>

      {/* Decline Reason Dialog */}
      {showDeclineDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grund für Absage</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Bitte gib einen Grund für deine Absage an. Dies hilft dem Coach, besser zu planen.
            </p>

            <textarea
              value={declineReason}
              onChange={(e) => {
                setDeclineReason(e.target.value);
                setError(null);
              }}
              placeholder="z.B. Krankheit, Familiäre Verpflichtungen, Anderer Termin..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all text-sm"
              rows={4}
              autoFocus
            />

            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeclineWithReason}
                disabled={isPending || !declineReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  "Absage bestätigen"
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeclineDialog(false);
                  setDeclineReason(currentDeclineReason || "");
                  setError(null);
                }}
                disabled={isPending}
                className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
