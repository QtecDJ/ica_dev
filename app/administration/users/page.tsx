"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import UserManagementImproved from "@/app/components/UserManagementImproved";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: string;
  member_id: number | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  team_name: string | null;
}

interface Team {
  id: number;
  name: string;
}

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Überprüfe Berechtigung
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Lade Daten direkt mit Server-Queries (da wir Admin-Rechte haben)
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching users from API...');
      const response = await fetch('/api/administration/users');
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Data received:', {
        users: data.users?.length || 0,
        members: data.members?.length || 0,
        teams: data.teams?.length || 0
      });
      console.log('👥 Users:', data.users);
      
      setUsers(data.users || []);
      setMembers(data.members || []);
      setTeams(data.teams || []);
    } catch (error) {
      console.error('💥 Error fetching data:', error);
      alert('Fehler beim Laden der Benutzerdaten. Bitte Konsole prüfen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.role === "admin" || session?.user.role === "manager") {
      fetchData();
    }
  }, [session]);

  // Callback für Updates - lädt Daten neu
  const handleUserUpdate = () => {
    fetchData();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
    return null;
  }

  return (
    <UserManagementImproved 
      users={users} 
      members={members} 
      teams={teams} 
      onUserUpdate={handleUserUpdate}
    />
  );
}
