import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { sql } from "@vercel/postgres";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL!;

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        try {
          const sql = neon(dbUrl);
          const result = await sql`
            SELECT id, email, password_hash, role, member_id, name
            FROM users
            WHERE email = ${email}
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
            email: user.email,
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
});
