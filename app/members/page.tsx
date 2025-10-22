import { getMembers, deleteMember } from "../actions";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import Image from "next/image";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mitglieder</h1>
        <Link
          href="/members/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neues Mitglied
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avatar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Geburtsdatum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member: any) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/members/${member.id}`} className="block">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                          {member.first_name[0]}{member.last_name[0]}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    href={`/members/${member.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                  >
                    {member.first_name} {member.last_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(member.birth_date).toLocaleDateString("de-DE")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.team_name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/members/${member.id}`}
                      className="text-green-600 hover:text-green-900"
                      title="Profil ansehen"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/members/${member.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Bearbeiten"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={member.id} action={deleteMember} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {members.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Noch keine Mitglieder vorhanden. Füge dein erstes Mitglied hinzu!
          </div>
        )}
      </div>
    </div>
  );
}
