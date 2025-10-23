import { getTeam, updateTeam } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  const team = await getTeam(parseInt(params.id));

  if (!team) {
    redirect("/teams");
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await updateTeam(parseInt(params.id), formData);
    if (result.success) {
      redirect("/teams");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/teams" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Teams
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Team bearbeiten
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {team.name}
        </p>
      </div>
      
      {/* Form Card */}
      <div className="card max-w-2xl">
        <div className="card-body">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={team.name}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="level" className="label">
                Level *
              </label>
              <input
                type="text"
                id="level"
                name="level"
                defaultValue={team.level}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="coach" className="label">
                Coach *
              </label>
              <input
                type="text"
                id="coach"
                name="coach"
                defaultValue={team.coach}
                required
                className="input"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Änderungen speichern
              </button>
              <Link href="/teams" className="btn btn-secondary flex-1 text-center">
                Abbrechen
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
