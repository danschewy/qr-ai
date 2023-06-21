/** server/uploadthing.ts */
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import type { Session } from "next-auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      const session = (await getServerAuthSession({ req, res })) as Session;
      console.dir(session);
      // If you throw, the user will not be able to upload
      if (!session.user) throw new Error("Unauthorized");

      return {};
    })
    .onUploadComplete(({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
