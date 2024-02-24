# ebinopdf

## Description

[ebinopdf.stevensho.com](https://ebinopdf.stevensho.com)

ebinopdf is a SaaS built with Next.JS 14, TypeScript, Prisma, AWS S3, Tailwind, and tRPC. It allows users to upload their PDF files to display in a highly functional and pretty PDF viewer. It also uses AI to stream real-time insights and summarized information on their files. Subscription plans offering different features are implemented using Stripe (everything is actually free to use though!) 

## Technologies Used

- **Frontend**: Next.JS 14, Tailwind CSS, Next.JS App Router, shadcn-ui (for UI components)
- **Backend**: Node.JS, tRPC
- **Database**: planetscale for database, Prisma for ORM, AWS S3 for object storage
- **Authentication**: Kinde Auth
- **Payment Processing**: Stripe
- **Other Libraries/Technologies**:
  - LangChain for AI context
  - Pinecone for vector storage
  - OpenAI for embeddings
  - Zod for TypeScript schema declaration and validation
  - AWS SDK for accessing S3 bucket

## Features

- Pretty, easy to use, and highly functional PDF viewer
- Intuitive interface for PDF uploads
- Real-time streaming API responses for quick insights into user PDFs
- Infinite message loading and opportunistic updates for seamless user experience
- Free and Pro plans subscriptions
- User registration and authentication

## Getting Started

To clone, run
`https://github.com/stevensho11/ebino-pdf.git`

Example .env.example file will show you what you need to get started :)
