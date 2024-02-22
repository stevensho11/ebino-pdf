import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Document, Page } from "react-pdf";
import { trpc } from "@/app/_trpc/client";

interface PdfFullscreenProps {
  fileId: string;
}

const PdfFullscreen = ({ fileId }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  const getSignedUrl = trpc.getSignedUrl.useMutation();

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
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button
          className="gap-1.5 xs:gap-0.5 "
          variant="ghost"
          aria-label="fullscreen"
        >
          <Expand className="sm:h-4 sm:w-4 xs:w-3 xs:h-3 " />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
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
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
