import { requireAuth } from "@/lib/auth-utils";
import NewEmailForm from "@/app/components/NewEmailForm";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function NewEmailPage() {
  await requireAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/emails" className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <Send className="w-8 h-8 text-red-600" />
            Neue Nachricht
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Verfasse eine neue Nachricht
          </p>
        </div>
      </div>

      {/* Form */}
      <NewEmailForm />
    </div>
  );
}
