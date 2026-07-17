import axiosInstance from "@/api/axiosConfig";

export interface StoreLegalPage {
  id: number;
  store_id: number;
  slug: string;
  title: string;
  content: string;
  language: string;
  sort_order: number;
  is_published: boolean;
}

export interface StoreLegalPageCreatePayload {
  store_id: number;
  slug: string;
  title: string;
  content: string;
  language?: string;
  sort_order?: number;
  is_published?: boolean;
}

export interface StoreLegalPageUpdatePayload {
  slug?: string;
  title?: string;
  content?: string;
  language?: string;
  sort_order?: number;
  is_published?: boolean;
}

export const getStoreLegalPagesManage = async (
  storeId: number | string,
): Promise<StoreLegalPage[]> => {
  try {
    const res = await axiosInstance.get(`store-legal/manage/${storeId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Get Store Legal Pages Error:", error);
    throw error;
  }
};

export const createStoreLegalPage = async (
  payload: StoreLegalPageCreatePayload,
): Promise<StoreLegalPage> => {
  try {
    const res = await axiosInstance.post("store-legal/", payload);
    return res.data;
  } catch (error) {
    console.error("Create Store Legal Page Error:", error);
    throw error;
  }
};

export const updateStoreLegalPage = async (
  pageId: number,
  payload: StoreLegalPageUpdatePayload,
): Promise<StoreLegalPage> => {
  try {
    const res = await axiosInstance.put(`store-legal/${pageId}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Store Legal Page Error:", error);
    throw error;
  }
};

export const deleteStoreLegalPage = async (pageId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`store-legal/${pageId}`);
  } catch (error) {
    console.error("Delete Store Legal Page Error:", error);
    throw error;
  }
};
