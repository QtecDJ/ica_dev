import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import CreateCalendarEventForm from "@/app/components/CreateCalendarEventForm";

export default async function NewCalendarEventPage() {
  await requireRole(["admin", "coach"]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/calendar"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zum Kalender</span>
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Kalender-Termin hinzufügen
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Erstelle einen allgemeinen Termin (Feiertag, Meeting, Deadline, etc.)
            </p>
          </div>
          <div className="card-body">
            <CreateCalendarEventForm />
          </div>
        </div>
      </div>
    </div>
  );
}
