import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';

export default async function DatabaseTestPage() {
  const session = await requireAuth();
  
  if (session.user.role !== 'admin') {
    return <div>Nur für Admins</div>;
  }

  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Test alle Tabellen und deren Struktur
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const usersStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;

    const membersStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'members' 
      ORDER BY ordinal_position
    `;

    // Beispiel Daten aus users
    const usersData = await sql`
      SELECT * FROM users 
      WHERE role = 'parent' 
      LIMIT 5
    `;

    // Beispiel Daten aus members
    const membersData = await sql`
      SELECT * FROM members 
      LIMIT 5
    `;

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Database Structure Test</h1>
        
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Alle Tabellen</h2>
          </div>
          <div className="card-body">
            <pre className="text-sm bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(tables, null, 2)}
            </pre>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Users Tabelle Struktur</h2>
          </div>
          <div className="card-body">
            <pre className="text-sm bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(usersStructure, null, 2)}
            </pre>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Members Tabelle Struktur</h2>
          </div>
          <div className="card-body">
            <pre className="text-sm bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(membersStructure, null, 2)}
            </pre>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Parent Users Beispieldaten</h2>
          </div>
          <div className="card-body">
            <pre className="text-sm bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(usersData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Members Beispieldaten</h2>
          </div>
          <div className="card-body">
            <pre className="text-sm bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(membersData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Database Error</h1>
        <p className="text-red-500">{String(error)}</p>
      </div>
    );
  }
}