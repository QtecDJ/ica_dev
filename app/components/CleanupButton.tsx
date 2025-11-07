"use client";

import { useState } from "react";
import { Trash2, RefreshCw, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface CleanupResult {
  success: boolean;
  message: string;
  cutoffDate?: string;
  deleted?: {
    trainings: number;
    attendance: number;
  };
  deletedTrainingDates?: string[];
  error?: string;
  details?: string;
}

export default function CleanupButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);

  const handleCleanup = async () => {
    if (!confirm("Möchtest du wirklich alle alten Trainings (älter als 1 Tag) löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/cron/cleanup-old-trainings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reload the page after successful cleanup to update statistics
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Fehler beim Cleanup",
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-orange-200 dark:border-orange-900">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Trash2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Alte Trainings löschen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Entfernt Trainings und Attendance-Daten, die älter als 1 Tag sind
            </p>
          </div>
        </div>
        <div className="space-y-4">
        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">Was wird gelöscht?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Trainings, die vor mehr als 1 Tag stattgefunden haben</li>
                <li>Alle Zusagen und Absagen für diese Trainings</li>
                <li>Alle Absagegründe</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                <strong>Hinweis:</strong> Dies geschieht normalerweise automatisch täglich um 3:00 Uhr morgens (UTC).
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCleanup}
          disabled={loading}
          className="w-full btn btn-danger"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Lösche alte Trainings...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5 mr-2" />
              Jetzt manuell ausführen
            </>
          )}
        </button>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-lg p-4 border ${
              result.success
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.success
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  }`}
                >
                  {result.message}
                </p>

                {result.success && result.deleted && (
                  <div className="mt-3 space-y-2">
                    {result.cutoffDate && (
                      <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Cutoff-Datum: <strong>{result.cutoffDate}</strong>
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {result.deleted.trainings}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Trainings gelöscht
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {result.deleted.attendance}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Attendance-Einträge gelöscht
                        </p>
                      </div>
                    </div>

                    {result.deletedTrainingDates && result.deletedTrainingDates.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
                          Gelöschte Training-Daten:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.deletedTrainingDates.slice(0, 10).map((date, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                            >
                              {new Date(date).toLocaleDateString("de-DE")}
                            </span>
                          ))}
                          {result.deletedTrainingDates.length > 10 && (
                            <span className="px-2 py-1 text-green-600 dark:text-green-400 text-xs">
                              +{result.deletedTrainingDates.length - 10} weitere
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-green-700 dark:text-green-300 mt-3">
                      ✅ Die Seite wird in 3 Sekunden automatisch aktualisiert...
                    </p>
                  </div>
                )}

                {!result.success && (result.error || result.details) && (
                  <p className="mt-2 text-sm text-red-800 dark:text-red-200">
                    {result.error || result.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
