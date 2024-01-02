import { useState } from "react";
import Dropzone from "react-dropzone";
import { Cloud, File, FileX } from "lucide-react";
import { Progress } from "./ui/progress";
import { trpc } from "@/app/_trpc/client";

const UploadDropzone: React.FC = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const getPresignedUrl = trpc.getPresignedUrl.useMutation();
  const validateFileSize = trpc.validateFileSize.useMutation();

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    // Validate file size and type
    try {
      const validationResponse = await validateFileSize.mutateAsync({
        fileSize: file.size,
        mimeType: file.type
      });

      if (!validationResponse.allowUpload) {
        console.error(`Upload denied: ${validationResponse.reason}`);
        return;
      }
    } catch (error) {
      console.error('Error during file validation', error);
      return;
    }

    // If validation passes, continue with upload process
    setIsUploading(true);
    try {
      const { url, fields } = await getPresignedUrl.mutateAsync({ fileName: file.name });

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('File uploaded successfully');
          setUploadProgress(100);
        } else {
          console.error('Failed to upload file');
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        console.error('File upload failed');
        setIsUploading(false);
      };

      xhr.open('POST', url);
      xhr.send(formData);
    } catch (error) {
      console.error('File upload failed', error);
      setIsUploading(false);
    }
  };


  
    return <Dropzone multiple={false} onDrop={(acceptedFiles) => handleFileUpload(acceptedFiles[0])}>
      {({getRootProps, getInputProps, acceptedFiles}) => (
        <div {...getRootProps()} className="border h-64 m-4 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center justify-center h-full w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2"/>
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">
                    Click to upload
                  </span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? acceptedFiles[0].type === 'application/pdf' ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-green-500"/>
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <FileX className="h-4 w-4 text-red-500"/>
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate text-red-500">
                    Please upload only PDF files
                  </div>
                </div>
              ) : (
                null
              )}
  
              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-1 w-full bg-zinc-200"/>
                </div>
              ) : (null)}
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  }

export default UploadDropzone