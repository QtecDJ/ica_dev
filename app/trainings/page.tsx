import { getTrainings, deleteTraining } from "../actions";
import { Plus, Pencil, Dumbbell } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import { requireRole } from "@/lib/auth-utils";

export default async function TrainingsPage() {
  // Only admin and coach can access this page
  await requireRole(["admin", "coach"]);
  
  const trainings = await getTrainings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Trainings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {trainings.length} {trainings.length === 1 ? 'Training' : 'Trainings'} insgesamt
          </p>
        </div>
        <Link href="/trainings/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Neues Training
        </Link>
      </div>

      {/* Trainings List */}
      {trainings.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card overflow-hidden">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Datum</th>
                    <th>Zeit</th>
                    <th>Ort</th>
                    <th className="text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.map((training: any) => (
                    <tr key={training.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            {training.team_name ? (
                              <span className="badge-blue">{training.team_name}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {new Date(training.training_date).toLocaleDateString("de-DE")}
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {training.start_time} - {training.end_time}
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {training.location}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/trainings/${training.id}/edit`}
                            className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteButton id={training.id} action={deleteTraining} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {trainings.map((training: any) => (
              <div key={training.id} className="card-hover">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                          {training.team_name || "Allgemeines Training"}
                        </h3>
                        {training.team_name && (
                          <span className="badge-blue text-xs mt-1 inline-block">
                            {training.team_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/trainings/${training.id}/edit`}
                        className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={training.id} action={deleteTraining} />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Datum:</span>
                      <span className="text-slate-900 dark:text-slate-50 font-medium">
                        {new Date(training.training_date).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Zeit:</span>
                      <span className="text-slate-900 dark:text-slate-50">
                        {training.start_time} - {training.end_time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Ort:</span>
                      <span className="text-slate-900 dark:text-slate-50">
                        {training.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Noch keine Trainings
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Erstelle dein erstes Training, um loszulegen!
            </p>
            <Link href="/trainings/new" className="btn btn-primary inline-flex">
              <Plus className="w-5 h-5" />
              Neues Training erstellen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
