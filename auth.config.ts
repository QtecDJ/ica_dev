import type { NextAuthOptions } from "next-auth";

export const authConfig: Partial<NextAuthOptions> = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.memberId = (user as any).memberId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.memberId = token.memberId as number | null;
      }
      return session;
    },
  },
};
