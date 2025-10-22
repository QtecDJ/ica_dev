import { getMember, getTeams } from "@/app/actions";
import { redirect } from "next/navigation";
import EditMemberForm from "@/app/components/EditMemberForm";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const member = await getMember(parseInt(params.id));
  const teams = await getTeams();

  if (!member) {
    redirect("/members");
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mitglied bearbeiten</h1>
        <EditMemberForm member={member} teams={teams} />
      </div>
    </div>
  );
}
