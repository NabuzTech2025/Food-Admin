import axiosInstance from "./axiosConfig";

export interface UploadImageResponse {
  url: string;
  image_url?: string;
}

export const uploadImage = async (
  payload: FormData,
): Promise<UploadImageResponse> => {
  try {
    const res = await axiosInstance.post(`images/upload`, payload);
    return res.data;
  } catch (error) {
    console.error("Upload Image Error:", error);
    throw error;
  }
};
