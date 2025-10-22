import { getStats } from "./actions";
import { Users, Calendar, Trophy, Dumbbell, TrendingUp, Star } from "lucide-react";

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            ∞
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Infinity Cheer Allstars
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-red-600 fill-red-600" />
              Backoffice Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          title="Teams"
          value={stats.teams}
          color="from-black to-gray-800"
          bgAccent="bg-gray-900"
          link="/teams"
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Mitglieder"
          value={stats.members}
          color="from-red-600 to-red-700"
          bgAccent="bg-red-600"
          link="/members"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Events"
          value={stats.events}
          color="from-gray-700 to-gray-900"
          bgAccent="bg-gray-700"
          link="/events"
        />
        <StatCard
          icon={<Dumbbell className="w-8 h-8" />}
          title="Trainings"
          value={stats.trainings}
          color="from-red-700 to-red-900"
          bgAccent="bg-red-700"
          link="/trainings"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Schnellzugriff</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              <QuickLink href="/teams" title="Teams verwalten" description="Erstellen und bearbeiten Sie Teams" icon="🏆" />
              <QuickLink href="/members" title="Mitglieder verwalten" description="Athleten und deren Informationen" icon="👥" />
              <QuickLink href="/events" title="Events planen" description="Wettkämpfe und Veranstaltungen" icon="📅" />
              <QuickLink href="/trainings" title="Trainings planen" description="Trainingszeiten organisieren" icon="💪" />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-3">
            <Star className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Systeminfo</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <InfoRow label="Gesamte Teams" value={stats.teams} />
              <InfoRow label="Gesamte Mitglieder" value={stats.members} />
              <InfoRow label="Aktive Events" value={stats.events} />
              <InfoRow label="Geplante Trainings" value={stats.trainings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, bgAccent, link }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  color: string;
  bgAccent: string;
  link: string;
}) {
  return (
    <a href={link} className="card p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-1 font-medium">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgAccent} bg-gradient-to-br ${color} text-white p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} w-full transform origin-left group-hover:scale-105 transition-transform`}></div>
      </div>
    </a>
  );
}

function QuickLink({ href, title, description, icon }: { href: string; title: string; description: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-600 hover:bg-red-50 transition-all group"
    >
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="text-2xl font-bold text-red-600">{value}</span>
    </div>
  );
}
