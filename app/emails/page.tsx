import { requireAuth } from "@/lib/auth-utils";
import { Inbox, Send, Star, Trash2, Mail } from "lucide-react";
import Link from "next/link";
import EmailsClient from "@/app/components/EmailsClient";

export const dynamic = 'force-dynamic';

export default async function EmailsPage() {
  await requireAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <Mail className="w-8 h-8 text-red-600" />
            Postfach
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Sende und empfange Nachrichten
          </p>
        </div>

        {/* New Email Button */}
        <Link href="/emails/new" className="btn-primary">
          <Send className="w-4 h-4" />
          Neue Nachricht
        </Link>
      </div>

      {/* Email Client */}
      <EmailsClient />
    </div>
  );
}
