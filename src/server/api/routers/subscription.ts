import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isUserSubscribed } from "~/utils/stripe";

export const subscriptionRouter = createTRPCRouter({
  getIsSubscribed: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      return isUserSubscribed(input.email);
    }),
});
