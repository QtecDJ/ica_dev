import { getMember, getTeam } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Phone, Calendar, Users, User as UserIcon, Edit } from "lucide-react";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const member = await getMember(parseInt(params.id));

  if (!member) {
    redirect("/members");
  }

  const team = member.team_id ? await getTeam(member.team_id) : null;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/members"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Übersicht
          </Link>
          <Link
            href={`/members/${params.id}/edit`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Link>
        </div>

        {/* ID Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform">
          {/* Card Header - Cheerleading Theme */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-32 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-4 right-4 text-white font-bold text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              INFINITY CHEER ALLSTARS
            </div>
          </div>

          {/* Profile Section */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-20 mb-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* ID Badge Number */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white">
                  #{member.id}
                </div>
              </div>
            </div>

            {/* Name and Team */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {member.first_name} {member.last_name}
              </h1>
              {team && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-semibold">{team.name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{team.level}</span>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Personal Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Persönliche Daten
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Geburtsdatum</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(member.birth_date).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-2xl">🎂</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Alter</p>
                      <p className="font-semibold text-gray-900">
                        {calculateAge(member.birth_date)} Jahre
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Kontakt
                </h3>
                <div className="space-y-3">
                  {member.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <a
                          href={`mailto:${member.email}`}
                          className="font-semibold text-purple-700 hover:text-purple-900 break-all"
                        >
                          {member.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Telefon</p>
                        <a
                          href={`tel:${member.phone}`}
                          className="font-semibold text-purple-700 hover:text-purple-900"
                        >
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {!member.email && !member.phone && (
                    <p className="text-gray-500 text-sm">Keine Kontaktdaten hinterlegt</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parent/Guardian Info */}
            {(member.parent_name || member.parent_email || member.parent_phone) && (
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                <h3 className="text-sm font-bold text-pink-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Erziehungsberechtigte(r)
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {member.parent_name && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Name</p>
                      <p className="font-semibold text-gray-900">{member.parent_name}</p>
                    </div>
                  )}
                  {member.parent_email && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${member.parent_email}`}
                        className="font-semibold text-pink-700 hover:text-pink-900 break-all"
                      >
                        {member.parent_email}
                      </a>
                    </div>
                  )}
                  {member.parent_phone && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Telefon</p>
                      <a
                        href={`tel:${member.parent_phone}`}
                        className="font-semibold text-pink-700 hover:text-pink-900"
                      >
                        {member.parent_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Mitglied seit {new Date(member.created_at).toLocaleDateString("de-DE")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
