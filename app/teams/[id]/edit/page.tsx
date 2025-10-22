import { getTeam, updateTeam } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Team bearbeiten</h1>
        
        <form action={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={team.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <input
              type="text"
              id="level"
              name="level"
              defaultValue={team.level}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="coach" className="block text-sm font-medium text-gray-700 mb-2">
              Coach *
            </label>
            <input
              type="text"
              id="coach"
              name="coach"
              defaultValue={team.coach}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Speichern
            </button>
            <Link
              href="/teams"
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Abbrechen
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
