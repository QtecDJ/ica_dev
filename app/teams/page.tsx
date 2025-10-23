import { getTeams, deleteTeam } from "../actions";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import { requireRole } from "@/lib/auth-utils";

export default async function TeamsPage() {
  // Only admin and coach can access this page
  await requireRole(["admin", "coach"]);
  
  const teams = await getTeams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Teams</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {teams.length} {teams.length === 1 ? 'Team' : 'Teams'} insgesamt
          </p>
        </div>
        <Link href="/teams/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Neues Team
        </Link>
      </div>

      {/* Teams Grid - Desktop: Table, Mobile: Cards */}
      {teams.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-hidden">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Coach</th>
                    <th>Erstellt</th>
                    <th className="text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-blue">Level {team.level}</span>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">{team.coach}</td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {new Date(team.created_at).toLocaleDateString("de-DE")}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/teams/${team.id}/edit`}
                            className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteButton id={team.id} action={deleteTeam} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="card-hover">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                          {team.name}
                        </h3>
                        <span className="badge-blue text-xs mt-1 inline-block">
                          Level {team.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/teams/${team.id}/edit`}
                        className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton id={team.id} action={deleteTeam} />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Coach:</span>
                      <span className="text-slate-900 dark:text-slate-50 font-medium">
                        {team.coach}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Erstellt:</span>
                      <span className="text-slate-900 dark:text-slate-50">
                        {new Date(team.created_at).toLocaleDateString("de-DE")}
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
              <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Noch keine Teams
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Erstelle dein erstes Team, um loszulegen!
            </p>
            <Link href="/teams/new" className="btn btn-primary inline-flex">
              <Plus className="w-5 h-5" />
              Neues Team erstellen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
