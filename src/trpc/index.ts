import { publicProcedure, router, privateProcedure } from "./trpc";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { s3Client } from "./s3-client";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

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
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  createFileRecord: privateProcedure
    .input(
      z.object({
        name: z.string(),
        key: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;

      const newFile = await db.file.create({
        data: {
          name: input.name,
          key: input.key,
          userId: userId,
          url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${input.key}`,
          uploadStatus: "PROCESSING",
        },
      });

      if (!newFile) throw new TRPCError({ code: "NOT_FOUND" });

      return newFile;
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
  validateFileSize: privateProcedure
    .input(
      z.object({
        fileSize: z.number(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { fileSize, mimeType } = input;
      const maxFileSize = 4 * 1024 * 1024; // 4 MB max file size

      console.log(`Received file size: ${fileSize}, MIME type: ${mimeType}`); // Debug log

      if (mimeType !== "application/pdf") {
        return { allowUpload: false, reason: "File must be a PDF" };
      }

      if (fileSize > maxFileSize) {
        return { allowUpload: false, reason: "File size too big" };
      }

      return { allowUpload: true, reason: "Good to upload" };
    }),
  getPresignedUrl: privateProcedure
    .input(z.object({ fileName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { fileName } = input;
      const uniqueFileName = `${uuidv4()}-${fileName}`;
      const { user, userId } = ctx;

      if (!user || !user.id || !user.email)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const postParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Fields: {
          key: uniqueFileName,
        },
        Expires: 60,
      };

      const presignedPostData = await s3Client.createPresignedPost(postParams);

      return { presignedPostData, key: uniqueFileName };
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),
  getSignedUrl: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, user } = ctx;

      if (!user || !user.id || !user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: user.id,
        },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found or access denied.",
        });
      }

      const signedUrl = s3Client.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.key,
        Expires: 60 * 5,
      });

      return { url: signedUrl };
    }),
  processPDF: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
        signedUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileId, signedUrl } = input;
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: userId,
        },
      });
      if (!file || file.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access Denied." });
      }
      try {
        const response = await fetch(signedUrl);
        const blob = await response.blob();

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();

        const pagesAmt = pageLevelDocs.length;

        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: fileId,
        });

        // Update file status to SUCCESS
        await db.file.update({
          where: { id: fileId },
          data: { uploadStatus: "SUCCESS" },
        });

        return { status: "success", message: "PDF processed successfully." };
      } catch (err) {
        // Log the error and update file status to FAILED
        console.error("Error processing PDF:", err);
        await db.file.update({
          where: { id: fileId },
          data: { uploadStatus: "FAILED" },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process PDF.",
        });
      }
    }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),
});

export type AppRouter = typeof appRouter;
