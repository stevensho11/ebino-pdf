import MaxWidthWrapper from "@/Components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRightCircle } from "lucide-react";
import { buttonVariants } from "@/Components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all ease-in-out duration-300 hover:scale-105 hover:border-gray-300 hover:bg-white/50">
          <p className="text-sm font-semibold text-gray-700 cursor-default">
            Ebino can read your PDF!
          </p>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Chat with <span className="text-teal-600">Ebino</span> about your{" "}
          <span className="text-teal-600">documents</span>
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          Gain quick, summarized insights about your PDF documents
        </p>

        <Link
          className={buttonVariants({
            size: "lg",
            className:
              "group mt-5 active:scale-95 transition-transform duration-100",
          })}
          href="/dashboard"
        >
          To Dashboard{" "}
          <ArrowRightCircle className="group-hover:translate-x-1 transition ease-in-out duration-300 ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>

      {/* value proposition section */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[42.125rem] -translate -x-1/2 bg-gradient-to-tr from-[#ff6b6b] to-[#3aafb9]
opacity-30 sm:left-[calc(50%-30rem)] sm:w-[84.1875rem]"
            />
          </div>
          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src="/ebino-dashboard-preview.jpg"
                    alt="product preview"
                    width={1364}
                    height={866}
                    quality={100}
                    priority={false}
                    className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-85"
          >
            <div
              style={{
                clipPath:
                  "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[42.125rem] -translate -x-1/2 bg-gradient-to-tr from-[#ff6b6b] to-[#3aafb9]
opacity-30 sm:left-[calc(50%-36rem)] sm:w-[84.1875rem] scale-y-[-1]"
            />
          </div>
        </div>
      </div>

      {/*feature*/}
      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-gray-900">
              Start chatting now
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Let Ebino take care of the tedious scanning and summarize your PDF
              for you in minutes
            </p>
          </div>
        </div>

        {/* steps */}
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-teal-600">Step 1</span>
              <span className="text-xl font-semibold">
                Sign up for an account
              </span>
              <span className="mt-2 text-zinc-700">
                Start with a free plan or subscribe to our{" "}
                <Link
                  href="/pricing"
                  className="text-teal-500 underline underline-offset-2"
                >
                  pro plan
                </Link>
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-teal-600">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your PDF files
              </span>
              <span className="mt-2 text-zinc-700">
                We will process and analyze your files to provide information
                and context about them
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-teal-600">Step 3</span>
              <span className="text-xl font-semibold">Ask away!</span>
              <span className="mt-2 text-zinc-700">
                Quick and simple - try it out today!
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src="/ebino-file-preview.jpg"
                alt="upload preview"
                width={1419}
                height={732}
                quality={100}
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
