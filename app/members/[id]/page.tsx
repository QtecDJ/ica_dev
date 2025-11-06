import { getMember, getTeam } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Edit } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import ProfileView from "@/app/components/ProfileView";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const member = await getMember(parseInt(params.id));

  if (!member) {
    redirect("/members");
  }

  const team = member.team_id ? await getTeam(member.team_id) : null;
  
  // Prepare member data for ProfileView component
  const memberData = {
    id: member.id,
    first_name: member.first_name,
    last_name: member.last_name,
    birth_date: member.birth_date,
    email: member.email,
    phone: member.phone,
    avatar_url: member.avatar_url,
    created_at: member.created_at,
    team_name: team?.name,
    team_level: team?.level,
    team_coach: team?.coach,
    parent_name: member.parent_name,
    parent_email: member.parent_email,
    parent_phone: member.parent_phone,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zur Übersicht</span>
        </Link>
        <Link
          href={`/members/${params.id}/edit`}
          className="btn btn-primary"
        >
          <Edit className="w-4 h-4" />
          Bearbeiten
        </Link>
      </div>

      {/* Unified Profile View */}
      <ProfileView 
        member={memberData}
        userRole={member.user_role}
        showAvatarUpload={false}
      />
    </div>
  );
}
