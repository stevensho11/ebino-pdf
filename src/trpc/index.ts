import { publicProcedure, router, privateProcedure } from "./trpc";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from "./s3-client";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    // check if user is in data
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      //create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ctx}) => {
    const {userId} = ctx

    return await db.file.findMany({
      where: {
        userId
      }
    })
  }),
  deleteFile: privateProcedure.input(z.object({id: z.string()})
  ).mutation(async ({ctx, input}) => {
    const {userId} = ctx
    const file = await db.file.findFirst({
      where: {
        id: input.id,
        userId,
      }
    })

    if(!file) throw new TRPCError({code: 'NOT_FOUND'})
    await db.file.delete({
      where: {
        id: input.id
      }
    })

    return file
  }),
  validateFileSize: privateProcedure
  .input(z.object({
    fileSize: z.number(),
    mimeType: z.string()
  }))
  .mutation(async ({ input }) => {
    const { fileSize, mimeType } = input;
    const maxFileSize = 4 * 1024 * 1024; // 4 MB max file size

    console.log(`Received file size: ${fileSize}, MIME type: ${mimeType}`); // Debug log

    if (mimeType !== 'application/pdf') {
      return { allowUpload: false, reason: 'File must be a PDF' };
    }

    if (fileSize > maxFileSize) {
      return {allowUpload: false, reason: 'File size too big'}
    }

    return { allowUpload: true, reason: 'Good to upload'};
  }),
  getPresignedUrl: privateProcedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ input }) => {
      const { fileName } = input;
      const uniqueFileName = `${uuidv4()}-${fileName}`;
      const { getUser } = getKindeServerSession();
      const user = await getUser();

    if (!user || !user.id || !user.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

      const postParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Fields: {
          key: uniqueFileName, // Use a unique name for the key
        },
        Expires: 60, // Time in seconds before the pre-signed URL expires
      };

      const presignedPostData = await s3Client.createPresignedPost(postParams);

      return presignedPostData;
    }),
});

export type AppRouter = typeof appRouter;
