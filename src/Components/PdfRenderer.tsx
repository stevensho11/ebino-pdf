"use client";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfRendererProps {
  fileId: string;
}

const PdfRenderer = ({ fileId }: PdfRendererProps) => {
  const [url, setUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const getSignedUrl = trpc.getSignedUrl.useMutation();
  const [isFetching, setIsFetching] = useState(false);
  const [curPage, setCurPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const isLoading = renderedScale !== scale;
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const handlePageSubmit = ({ page }: TPageValidator) => {
    setCurPage(Number(page));
    setValue("page", String(page));
  };

  const PageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });
  type TPageValidator = z.infer<typeof PageValidator>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(PageValidator),
  });

  useEffect(() => {
    if (fileId && !isFetching) {
      setIsFetching(true);
      getSignedUrl.mutate(
        { fileId: fileId },
        {
          onSuccess: (data) => {
            setUrl(data.url);
            setIsFetching(false);
          },
          onError: (error) => {
            console.error("Failed to get signed URL", error);
            setIsFetching(false);
          },
        }
      );
    }
  }, [fileId]);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center sm:gap-1.5 xs:gap-0.5">
          <Button
            disabled={curPage <= 1}
            onClick={() => {
              setCurPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(curPage - 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="sm:h-4 sm:w-4 xs:w-3 xs:h-3 " />
          </Button>
          <div className="flex items-center sm:gap-1.5 xs:gap-0.5">
            <Input
              {...register("page")}
              className={cn(
                "sm:w-12 sm:h-8 xs:w-8 xs:h-6",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 sm:text-sm space-x-1 xs:text-xs">
              <span>/</span>
              <span>{numPages ?? "?"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || curPage === numPages}
            onClick={() => {
              setCurPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page", String(curPage + 1));
            }}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUp className="sm:h-4 sm:w-4 xs:w-3 xs:h-3 " />
          </Button>
        </div>

        <div className="flex items-center sm:gap-1.5 xs:gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="sm:h-4 sm:w-4 xs:w-3 xs:h-3 " />
                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-75" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setScale(0.5)}
              >
                50%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setScale(1)}
              >
                100%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setScale(1.5)}
              >
                150%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setScale(2)}
              >
                200%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setScale(2.5)}
              >
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="sm:h-4 sm:w-4 xs:w-3 xs:h-3 " />
          </Button>

          <PdfFullscreen fileId={fileId} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max-h-full"
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={curPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={curPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
