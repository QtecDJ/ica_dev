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
  coach_id: number | null;
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
    
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Lade Daten direkt mit Server-Queries (da wir Admin-Rechte haben)
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/administration/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setMembers(data.members || []);
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.role === "admin") {
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

  if (!session || session.user.role !== "admin") {
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
