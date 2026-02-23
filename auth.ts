import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PlanTier } from "@prisma/client";
import { compare } from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { createApiToken } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      planTier: PlanTier;
      apiToken: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    planTier?: PlanTier;
    apiToken?: string | null;
  }
}

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers = [
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = credentialSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (!user || !user.passwordHash) return null;

      const passwordValid = await compare(parsed.data.password, user.passwordHash);
      if (!passwordValid) return null;

      if (!user.apiToken) {
        const refreshed = await prisma.user.update({
          where: { id: user.id },
          data: { apiToken: createApiToken() },
        });
        user.apiToken = refreshed.apiToken;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        planTier: user.planTier,
        apiToken: user.apiToken,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.planTier = (user as { planTier?: PlanTier }).planTier ?? "FREE";
        token.apiToken = (user as { apiToken?: string | null }).apiToken ?? null;
      }

      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.planTier = dbUser.planTier;
          token.apiToken = dbUser.apiToken;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.planTier = token.planTier ?? "FREE";
        session.user.apiToken = token.apiToken ?? null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser?.apiToken) {
        await prisma.user.update({
          where: { id: user.id },
          data: { apiToken: createApiToken() },
        });
      }
    },
  },
});
