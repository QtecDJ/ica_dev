import { getStats } from "./actions";
import { Users, Calendar, Trophy, Dumbbell } from "lucide-react";

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Infinity Cheer Allstars
        </h1>
        <p className="text-gray-600">Willkommen im Backoffice-System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          title="Teams"
          value={stats.teams}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Mitglieder"
          value={stats.members}
          color="bg-green-500"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Events"
          value={stats.events}
          color="bg-purple-500"
        />
        <StatCard
          icon={<Dumbbell className="w-8 h-8" />}
          title="Trainings"
          value={stats.trainings}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLink href="/teams" title="Teams verwalten" description="Erstellen und bearbeiten Sie Teams" />
          <QuickLink href="/members" title="Mitglieder verwalten" description="Athleten und deren Informationen verwalten" />
          <QuickLink href="/events" title="Events planen" description="Wettkämpfe und Veranstaltungen organisieren" />
          <QuickLink href="/trainings" title="Trainings planen" description="Trainingszeiten und -orte verwalten" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  );
}
