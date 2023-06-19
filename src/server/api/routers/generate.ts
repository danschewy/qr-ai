import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createGeneration } from "~/utils/replicate";

export const generationRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({ url: z.string(), style: z.string() }))
    .mutation(async ({ input }) => {
      // hit replicate api
      let image;
      try {
        image = await createGeneration();
      } catch (e) {
        return {
          error: "Something went wrong",
        };
      }
      //return image
      return {
        url: image,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
