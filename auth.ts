import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
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
          const sql = neon(process.env.DATABASE_URL!);
          const result = await sql`
            SELECT u.id, u.username, u.password_hash, u.role, u.roles, u.member_id, u.name, m.avatar_url
            FROM users u
            LEFT JOIN members m ON u.member_id = m.id
            WHERE u.username = ${username}
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
            email: user.username, // Use username as email for NextAuth compatibility
            name: user.name,
            role: user.role,
            roles: user.roles || [],
            memberId: user.member_id,
            image: user.avatar_url || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
});
