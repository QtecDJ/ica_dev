import { Metadata } from "next"
import { requireAuth } from "@/lib/auth-utils"
import ParentChildManager from "@/app/components/ParentChildManager"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Parent-Child Verwaltung | ICA Admin",
  description: "Verwalte Verknüpfungen zwischen Eltern und Kindern",
}

export default async function ParentChildManagementPage() {
  const session = await requireAuth();
  
  // Only allow admins
  if (session.user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-slate-600">Diese Seite ist nur für Administratoren verfügbar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Admin-Übersicht
        </Link>
      </div>
      
      <ParentChildManager />
    </div>
  );
}