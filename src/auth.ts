import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const manager = await prisma.manager.findUnique({
          where: { discordId: user.id },
        });

        const isOwner = user.id === process.env.OWNER_DISCORD_ID;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = isOwner
          ? "owner"
          : manager
            ? "manager"
            : "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
