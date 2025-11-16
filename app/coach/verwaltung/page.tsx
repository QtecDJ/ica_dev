import { requireAuth, hasAnyRole } from "@/lib/auth-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import CoachVerwaltungView from "@/app/components/CoachVerwaltungView";

export const dynamic = 'force-dynamic';

export default async function CoachVerwaltungPage() {
  const session = await requireAuth();
  
  // Nur Coaches, Admins und Manager haben Zugriff
  if (!hasAnyRole(session, ["coach", "admin", "manager"])) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <CoachVerwaltungView />
    </div>
  );
}
