import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createGeneration } from "~/utils/replicate";
export const generationRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        url: z.optional(z.string()),
        style: z.string(),
        image: z.optional(z.string()),
      })
    )
    .mutation(async ({ input: { style, image } }) => {
      // hit replicate api
      let resultImage;
      try {
        if (!image) throw new Error("No image provided");
        resultImage = await createGeneration(style, image);
      } catch (e) {
        return {
          error: "Something went wrong",
        };
      }
      //return image
      return {
        url: resultImage,
      };
    }),
});
