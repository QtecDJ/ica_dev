"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { updateAttendanceStatus } from "@/app/actions";
import { useRouter } from "next/navigation";

interface TrainingAttendanceButtonsProps {
  trainingId: number;
  memberId: number;
  currentStatus: "accepted" | "declined" | "pending";
}

export default function TrainingAttendanceButtons({
  trainingId,
  memberId,
  currentStatus,
}: TrainingAttendanceButtonsProps) {
  const [status, setStatus] = useState<"accepted" | "declined" | "pending">(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = async (newStatus: "accepted" | "declined") => {
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
    </div>
  );
}
