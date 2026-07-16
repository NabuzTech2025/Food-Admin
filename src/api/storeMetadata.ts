import axiosInstance from "@/api/axiosConfig";

export interface HeadingItem {
  tag: string;
  text: string;
}

export interface ImageAltText {
  image_url: string;
  alt: string;
}

export interface StoreMetadataPayload {
  page_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  slug: string;
  canonical_url: string;
  robots_directive: string;
  h1_heading: string;
  h2_h3_headings: HeadingItem[];
  image_alt_texts: ImageAltText[];
  language: string;
  structured_data: Record<string, unknown>;
  sitemap: string[];
  robots_txt: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

export interface StoreMetadataCreatePayload extends StoreMetadataPayload {
  store_id: number;
}

export interface StoreMetadata extends StoreMetadataPayload {
  id: number;
  store_id: number;
  created_at: string;
  updated_at: string;
}

export const getStoreMetadata = async (
  storeId: number | string,
): Promise<StoreMetadata | null> => {
  try {
    const res = await axiosInstance.get(`store-metadata/${storeId}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get Store Metadata Error:", error);
    throw error;
  }
};

export const createStoreMetadata = async (
  payload: StoreMetadataCreatePayload,
): Promise<StoreMetadata> => {
  try {
    const res = await axiosInstance.post("store-metadata/", payload);
    return res.data;
  } catch (error) {
    console.error("Create Store Metadata Error:", error);
    throw error;
  }
};

export const updateStoreMetadata = async (
  storeId: number | string,
  payload: StoreMetadataPayload,
): Promise<StoreMetadata> => {
  try {
    const res = await axiosInstance.put(`store-metadata/${storeId}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Store Metadata Error:", error);
    throw error;
  }
};

export const deleteStoreMetadata = async (
  storeId: number | string,
): Promise<void> => {
  try {
    await axiosInstance.delete(`store-metadata/${storeId}`);
  } catch (error) {
    console.error("Delete Store Metadata Error:", error);
    throw error;
  }
};
