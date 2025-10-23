import { getTeams } from "@/app/actions";
import NewMemberForm from "@/app/components/NewMemberForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewMemberPage() {
  const teams = await getTeams();

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/members" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Mitgliedern
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Neues Mitglied erstellen
        </h1>
      </div>
      <div className="max-w-3xl">
        <NewMemberForm teams={teams} />
      </div>
    </div>
  );
}
