import { getTeams } from "@/app/actions";
import NewMemberForm from "@/app/components/NewMemberForm";

export default async function NewMemberPage() {
  const teams = await getTeams();

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Neues Mitglied erstellen</h1>
        <NewMemberForm teams={teams} />
      </div>
    </div>
  );
}
