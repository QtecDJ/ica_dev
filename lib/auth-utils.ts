import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export const authOptions = {
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        if (!username || !password) return null;

        try {
          if (!process.env.DATABASE_URL) {
            console.error("DATABASE_URL not found");
            return null;
          }
          
          const sql = neon(process.env.DATABASE_URL);
          const result = await sql`
            SELECT id, username, password_hash, role, member_id, name
            FROM users
            WHERE username = ${username}
          `;

          if (result.length === 0) return null;

          const user = result[0];
          const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
          );

          if (!passwordMatch) return null;

          return {
            id: user.id.toString(),
            email: user.username,
            name: user.name,
            role: user.role,
            memberId: user.member_id,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
};

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session as any;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes((session.user as any).role)) {
    redirect("/");
  }
  return session;
}

export function canAccessMember(session: any, memberId: number): boolean {
  // Admin, Manager and Coach can access all members
  if (session.user.role === "admin" || session.user.role === "manager" || session.user.role === "coach") {
    return true;
  }

  // Members can only access their own profile
  if (session.user.role === "member" && session.user.memberId === memberId) {
    return true;
  }

  // Parents need to check parent_children table (handled in component)
  return false;
}

export function isAdmin(session: any): boolean {
  return session?.user?.role === "admin";
}

export function isAdminOrManager(session: any): boolean {
  return session?.user?.role === "admin" || session?.user?.role === "manager";
}
