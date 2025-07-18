import { NextAuthOptions } from "next-auth";
import OsuProvider from "next-auth/providers/osu";
import { prisma } from "./database/prisma";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    OsuProvider({
      clientId: "38478",
      clientSecret: "LK79fSCStkVvPtgtxFpTr0QWyJlJuo7oU2cQ9doX",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const userExists = await prisma.user.findFirst({
        where: { id: parseInt(user.id, 10) },
      });

      if (!userExists) {
        await prisma.user.create({
          data: {
            id: parseInt(user.id, 10),
            username: user.name!,
            hasCreatedAccount: true,
          },
        });
      } else if (userExists && !userExists.hasCreatedAccount) {
        await prisma.user.update({
          where: { id: userExists.id },
          data: { hasCreatedAccount: true },
        });
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account && account.access_token) {
        token.token = account?.access_token;
      }

      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          id: parseInt(token.sub || token.id!.toString(), 10),
          name: token.name,
        },
      };
    },
  },
};
