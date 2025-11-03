import { getTrainings, deleteTraining } from "../actions";
import { Plus, Pencil, Dumbbell, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import { requireAuth } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

export const dynamic = 'force-dynamic';

export default async function TrainingsPage() {
  // Allow all authenticated users to view trainings
  const session = await requireAuth();
  const userRole = session.user.role;
  const userId = session.user.id;
  
  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole Trainings basierend auf Benutzerrolle
  let trainings: any[] = [];
  let userTeamId = null;
  
  if (userRole === "admin") {
    // Admins sehen alle Trainings
    trainings = await sql`
      SELECT t.*, teams.name as team_name, 'admin' as user_relation
      FROM trainings t
      LEFT JOIN teams ON t.team_id = teams.id
      WHERE t.training_date >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY t.training_date ASC, t.start_time ASC
    `;
  } else if (userRole === "coach") {
    // Coaches sehen Trainings ihrer eigenen Teams UND das Team in dem sie Mitglied sind
    const coachTeams = await sql`
      SELECT DISTINCT t.id 
      FROM teams t
      JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
    `;
    
    // Prüfe ob Coach auch ein Mitglied ist und hole sein Team
    const coachMemberTeam = await sql`
      SELECT DISTINCT m.team_id
      FROM users u
      JOIN members m ON u.member_id = m.id
      WHERE u.id = ${userId} AND m.team_id IS NOT NULL
    `;
    
    // Sammle alle Team-IDs (sowohl gecoachte Teams als auch eigenes Mitglieder-Team)
    let teamIds = coachTeams.map(team => team.id);
    if (coachMemberTeam.length > 0) {
      const memberTeamId = coachMemberTeam[0].team_id;
      if (!teamIds.includes(memberTeamId)) {
        teamIds.push(memberTeamId);
      }
    }
    
    if (teamIds.length > 0) {
      trainings = await sql`
        SELECT t.*, teams.name as team_name,
               CASE 
                 WHEN t.team_id = ANY(${coachTeams.map(team => team.id)}) THEN 'coached'
                 ELSE 'member'
               END as user_relation
        FROM trainings t
        LEFT JOIN teams ON t.team_id = teams.id
        WHERE t.team_id = ANY(${teamIds})
        AND t.training_date >= CURRENT_DATE - INTERVAL '1 day'
        ORDER BY t.training_date ASC, t.start_time ASC
      `;
    } else {
      trainings = [];
    }
  } else if (userRole === "parent") {
    // Parents sehen nur Trainings des Teams ihres Kindes
    const children = await sql`
      SELECT DISTINCT m.team_id
      FROM parent_children pc
      JOIN members m ON pc.child_member_id = m.id
      WHERE pc.parent_user_id = ${userId}
      AND m.team_id IS NOT NULL
    `;
    
    if (children.length > 0) {
      userTeamId = children[0].team_id;
      trainings = await sql`
        SELECT t.*, teams.name as team_name
        FROM trainings t
        LEFT JOIN teams ON t.team_id = teams.id
        WHERE t.team_id = ${userTeamId}
        AND t.training_date >= CURRENT_DATE - INTERVAL '1 day'
        ORDER BY t.training_date ASC, t.start_time ASC
      `;
    } else {
      trainings = [];
    }
  } else if (userRole === "member") {
    // Members sehen nur Trainings ihres eigenen Teams
    const userMember = await sql`
      SELECT m.team_id
      FROM users u
      JOIN members m ON u.member_id = m.id
      WHERE u.id = ${userId}
      AND m.team_id IS NOT NULL
    `;
    
    if (userMember.length > 0 && userMember[0].team_id) {
      userTeamId = userMember[0].team_id;
      trainings = await sql`
        SELECT t.*, teams.name as team_name
        FROM trainings t
        LEFT JOIN teams ON t.team_id = teams.id
        WHERE t.team_id = ${userTeamId}
        AND t.training_date >= CURRENT_DATE - INTERVAL '1 day'
        ORDER BY t.training_date ASC, t.start_time ASC
      `;
    } else {
      trainings = [];
    }
  } else {
    trainings = [];
  }

  // Determine permissions
  const canManageTrainings = userRole === "admin" || userRole === "coach";

  // Helper function to check if training is upcoming (within 1 day)
  const isUpcomingTraining = (trainingDate: string) => {
    const training = new Date(trainingDate);
    const now = new Date();
    const timeDiff = training.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 1 && daysDiff >= 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {userRole === "parent" ? "Trainings deines Kindes" : "Trainings"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {userRole === "parent" 
              ? `${trainings.length} Trainings in dieser Woche`
              : `${trainings.length} ${trainings.length === 1 ? 'Training' : 'Trainings'} insgesamt`
            }
          </p>
        </div>
        {canManageTrainings && (
          <Link href="/trainings/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Neues Training
          </Link>
        )}
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
                    {userRole === "parent" && <th>Details</th>}
                    {canManageTrainings && <th className="text-right">Aktionen</th>}
                  </tr>
                </thead>
                <tbody>
                  {trainings.map((training: any) => (
                    <tr 
                      key={training.id}
                      className={isUpcomingTraining(training.training_date) ? "training-upcoming" : ""}
                    >
                      <td>
                        <Link 
                          href={`/trainings/${training.id}`}
                          className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            {training.team_name ? (
                              <span className={`badge-red ${isUpcomingTraining(training.training_date) ? 'training-upcoming-badge' : ''}`}>
                                {training.team_name}
                              </span>
                            ) : (
                              <span className="text-slate-400">Allgemein</span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        <div className={`font-medium ${isUpcomingTraining(training.training_date) ? 'training-upcoming-text' : ''}`}>
                          {new Date(training.training_date).toLocaleDateString("de-DE", {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                          {isUpcomingTraining(training.training_date) && (
                            <span className="ml-2 text-xs font-bold">🔴 BALD!</span>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {training.start_time} - {training.end_time}
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {training.location}
                        </div>
                      </td>
                      {userRole === "parent" && (
                        <td className="text-slate-600 dark:text-slate-400">
                          {training.notes && (
                            <div className="text-sm max-w-xs truncate">
                              {training.notes}
                            </div>
                          )}
                        </td>
                      )}
                      {canManageTrainings && (
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {trainings.map((training: any) => (
              <div 
                key={training.id} 
                className={`card ${isUpcomingTraining(training.training_date) ? 'training-upcoming' : ''}`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/trainings/${training.id}`} className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                          {training.team_name || "Allgemeines Training"}
                          {isUpcomingTraining(training.training_date) && (
                            <span className="ml-2 text-xs font-bold training-upcoming-text">🔴 BALD!</span>
                          )}
                        </h3>
                        {training.team_name && (
                          <span className={`badge-red text-xs mt-1 inline-block ${isUpcomingTraining(training.training_date) ? 'training-upcoming-badge' : ''}`}>
                            {training.team_name}
                          </span>
                        )}
                        {userRole === "parent" && training.notes && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                            {training.notes}
                          </p>
                        )}
                      </div>
                    </Link>
                    {canManageTrainings && (
                      <div className="flex gap-2 ml-3">
                        <Link
                          href={`/trainings/${training.id}/edit`}
                          className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={training.id} action={deleteTraining} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Datum:</span>
                      <span className="text-slate-900 dark:text-slate-50 font-medium">
                        {new Date(training.training_date).toLocaleDateString("de-DE", {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Zeit:</span>
                      <span className="text-slate-900 dark:text-slate-50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {training.start_time} - {training.end_time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Ort:</span>
                      <span className="text-slate-900 dark:text-slate-50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
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
              {userRole === "parent" || userRole === "member" ? "Noch keine Trainings" : "Noch keine Trainings"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {userRole === "parent" 
                ? "Sobald Trainings für das Team deines Kindes angesetzt sind, werden sie hier angezeigt."
                : userRole === "member"
                ? "Sobald Trainings für dein Team angesetzt sind, werden sie hier angezeigt."
                : "Erstelle dein erstes Training, um loszulegen!"
              }
            </p>
            {canManageTrainings && (
              <Link href="/trainings/new" className="btn btn-primary inline-flex">
                <Plus className="w-5 h-5" />
                Neues Training erstellen
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Special Info for Parents */}
      {userRole === "parent" && trainings.length > 0 && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="card-body">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              💪 Training-Informationen für dein Kind
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Wichtige Hinweise</h4>
                <ul className="space-y-1 text-red-700 dark:text-red-300">
                  <li>• Bitte sorge dafür, dass dein Kind 15 Min. vor Trainingsbeginn da ist</li>
                  <li>• Ausreichend Wasser und ein Handtuch mitbringen</li>
                  <li>• Bei Krankheit bitte rechtzeitig abmelden</li>
                  <li>• Trainingszeiten können sich kurzfristig ändern</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Kontakt</h4>
                <div className="space-y-1 text-red-700 dark:text-red-300">
                  <p>Bei Fragen zu Trainings wende dich an:</p>
                  <p className="font-medium">Coach des Teams</p>
                  <p className="text-xs">Kontaktdaten findest du in der Team-Übersicht</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
