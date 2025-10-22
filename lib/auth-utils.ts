import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

export function canAccessMember(session: any, memberId: number): boolean {
  // Admin and Coach can access all members
  if (session.user.role === "admin" || session.user.role === "coach") {
    return true;
  }

  // Members can only access their own profile
  if (session.user.role === "member" && session.user.memberId === memberId) {
    return true;
  }

  // Parents need to check parent_children table (handled in component)
  return false;
}
