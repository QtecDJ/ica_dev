import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import TrainingReports from "@/app/components/TrainingReports";

export const metadata: Metadata = {
  title: "Admin Berichte - ICA Backoffice",
  description: "Administrative Berichte und Statistiken",
};

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  
  // Check roles array for access
  const userRoles = (session?.user as any)?.roles || [session?.user?.role];
  const hasAccess = userRoles.includes("admin") || userRoles.includes("manager");
  
  if (!session || !hasAccess) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <TrainingReports />
    </div>
  );
}