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
  
  if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <TrainingReports />
    </div>
  );
}