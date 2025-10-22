import { createTeam } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function NewTeamPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await createTeam(formData);
    if (result.success) {
      redirect("/teams");
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Neues Team erstellen</h1>
        
        <form action={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. Junior Stars"
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. Level 2, Beginner, Advanced"
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Name des Coaches"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Team erstellen
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
