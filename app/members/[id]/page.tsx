import { getMember, getTeam, getMemberComments, getMemberAttendance } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Phone, Calendar, Users, User as UserIcon, Edit } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import CommentsSection from "@/app/components/CommentsSection";
import type { Session } from "next-auth";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const member = await getMember(parseInt(params.id));

  if (!member) {
    redirect("/members");
  }

  const team = member.team_id ? await getTeam(member.team_id) : null;
  const comments = await getMemberComments(parseInt(params.id));
  const attendance = await getMemberAttendance(parseInt(params.id));

  // Check if user can comment (admin or coach)
  const canComment =
    session?.user && ["admin", "coach"].includes(session.user.role);

  // Filter comments based on role
  const visibleComments: any[] =
    session?.user && ["admin", "coach"].includes(session.user.role)
      ? comments
      : comments.filter((c: any) => !c.is_private);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zur Übersicht</span>
        </Link>
        <Link
          href={`/members/${params.id}/edit`}
          className="btn btn-primary"
        >
          <Edit className="w-4 h-4" />
          Bearbeiten
        </Link>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-center -mt-8 mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={`${member.first_name} ${member.last_name}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white dark:border-slate-900">
                {member.id}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {member.first_name} {member.last_name}
            </h1>
            {team && (
              <div className="inline-flex items-center gap-2 badge badge-blue">
                <Users className="w-4 h-4" />
                <span>{team.name}</span>
                <span>•</span>
                <span>{team.level}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-body">
          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Persönliche Daten
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Geburtsdatum</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(member.birth_date).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-xl">🎂</div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Alter</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {calculateAge(member.birth_date)} Jahre
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Kontakt
              </h3>
              <div className="space-y-3">
                {member.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                      <a
                        href={`mailto:${member.email}`}
                        className="font-medium text-red-600 dark:text-red-400 hover:underline break-all"
                      >
                        {member.email}
                      </a>
                    </div>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Telefon</p>
                      <a
                        href={`tel:${member.phone}`}
                        className="font-medium text-red-600 dark:text-red-400 hover:underline"
                      >
                        {member.phone}
                      </a>
                    </div>
                  </div>
                )}
                {!member.email && !member.phone && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Keine Kontaktdaten hinterlegt</p>
                )}
              </div>
            </div>
          </div>

          {/* Parent/Guardian Info */}
          {(member.parent_name || member.parent_email || member.parent_phone) && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                Erziehungsberechtigte(r)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {member.parent_name && (
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Name</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">{member.parent_name}</p>
                  </div>
                )}
                {member.parent_email && (
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Email</p>
                    <a
                      href={`mailto:${member.parent_email}`}
                      className="font-medium text-red-600 dark:text-red-400 hover:underline break-all"
                    >
                      {member.parent_email}
                    </a>
                  </div>
                )}
                {member.parent_phone && (
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Telefon</p>
                    <a
                      href={`tel:${member.parent_phone}`}
                      className="font-medium text-red-600 dark:text-red-400 hover:underline"
                    >
                      {member.parent_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card-footer">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            Mitglied seit {new Date(member.created_at).toLocaleDateString("de-DE")}
          </p>
        </div>
      </div>

      {/* Training Attendance History */}
      {attendance && attendance.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Trainingsteilnahme
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {attendance.map((att: any) => (
                <div
                  key={att.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {new Date(att.training_date).toLocaleDateString("de-DE", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {att.start_time.slice(0, 5)} - {att.end_time.slice(0, 5)} • {att.location}
                    </p>
                    {att.team_name && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{att.team_name}</p>
                    )}
                  </div>
                  <div>
                    {att.status === "accepted" && (
                      <span className="badge badge-green">Zugesagt</span>
                    )}
                    {att.status === "declined" && (
                      <span className="badge badge-red">Abgesagt</span>
                    )}
                    {att.status !== "accepted" && att.status !== "declined" && (
                      <span className="badge badge-gray">Ausstehend</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {session?.user && (
        <CommentsSection
          comments={visibleComments}
          authorId={session.user.id}
          memberId={parseInt(params.id)}
          canComment={canComment || false}
        />
      )}
    </div>
  );
}
