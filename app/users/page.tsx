import { requireRole } from "@/lib/auth-utils";
import CreateUserForm from "@/app/components/CreateUserForm";
import { UserPlus, Shield } from "lucide-react";

export default async function UsersManagementPage() {
  // Nur Admins dürfen diese Seite sehen
  await requireRole(["admin"]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Benutzerverwaltung
            </h1>
            <p className="text-gray-600">Erstelle Zugänge für Mitglieder und Coaches</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create User Form */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Neuen Benutzer erstellen</h2>
          </div>
          <div className="p-6">
            <CreateUserForm />
          </div>
        </div>

        {/* Info Box */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Rollen-Informationen</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded">
              <h3 className="font-bold text-red-900 mb-1">Administrator</h3>
              <p className="text-sm text-red-800">
                Vollzugriff auf alle Funktionen, kann Benutzer erstellen und verwalten.
              </p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <h3 className="font-bold text-blue-900 mb-1">Coach</h3>
              <p className="text-sm text-blue-800">
                Kann Teams verwalten, Trainings planen und Kommentare schreiben.
              </p>
            </div>
            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <h3 className="font-bold text-green-900 mb-1">Mitglied</h3>
              <p className="text-sm text-green-800">
                Kann eigenes Profil sehen, Trainings zu-/absagen und Kommentare lesen.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
              <h3 className="font-bold text-purple-900 mb-1">Elternteil</h3>
              <p className="text-sm text-purple-800">
                Kann Profile der eigenen Kinder sehen und deren Trainings verwalten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
