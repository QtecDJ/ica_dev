import { getMember, getTeams } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditMemberForm from "@/app/components/EditMemberForm";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const member = await getMember(parseInt(params.id));
  const teams = await getTeams();

  if (!member) {
    redirect("/members");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/members/${params.id}`}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zum Profil</span>
        </Link>
      </div>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">
          Mitglied bearbeiten
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Aktualisiere die Informationen von {member.first_name} {member.last_name}
        </p>
      </div>

      <div className="max-w-3xl">
        <EditMemberForm member={member} teams={teams} />
      </div>
    </div>
  );
}
