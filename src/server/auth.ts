/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type GetServerSidePropsContext } from "next";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { getServerSession } from "next-auth/next";
import { type Session } from "next-auth";
import { type NextAuthOptions } from "next-auth";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // session.user.role = user.role; <-- put other properties on the session here
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return getServerSession(ctx.req, ctx.res, authOptions);
};
