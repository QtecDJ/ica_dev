"use client";
import { useState } from "react";
import { createMember, getTeams } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AvatarUpload from "@/app/components/AvatarUpload";

export default function NewMemberForm({ teams }: { teams: any[] }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("avatar_url", avatarUrl);

    const result = await createMember(formData);
    
    if (result.success) {
      router.push("/members");
    } else {
      alert("Fehler beim Erstellen des Mitglieds");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <AvatarUpload onAvatarChange={setAvatarUrl} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
            Vorname *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nachname *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
            Geburtsdatum *
          </label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 mb-2">
            Team
          </label>
          <select
            id="team_id"
            name="team_id"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Kein Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Elterninformationen</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700 mb-2">
              Name Erziehungsberechtigte(r)
            </label>
            <input
              type="text"
              id="parent_name"
              name="parent_name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-2">
                Eltern Email
              </label>
              <input
                type="email"
                id="parent_email"
                name="parent_email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Eltern Telefon
              </label>
              <input
                type="tel"
                id="parent_phone"
                name="parent_phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Wird erstellt..." : "Mitglied erstellen"}
        </button>
        <Link
          href="/members"
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-center"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
