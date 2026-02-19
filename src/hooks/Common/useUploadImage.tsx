import { uploadImage } from "@/api/uploadImage";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UploadImageData {
  file: File;
}

export interface UploadImageResponse {
  url: string;
  image_url?: string;
}

async function uploadImageFn(
  data: UploadImageData,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  return await uploadImage(formData);
}

export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImageFn,
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to upload image";
      toast.error(msg);
    },
  });
}
