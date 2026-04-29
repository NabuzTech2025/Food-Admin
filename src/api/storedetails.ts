import axiosInstance from "@/api/axiosConfig";

export interface Store {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  logo?: string;
  banner_url?: string;
  banner?: string;
  address?: string;
  country?: string;
 
  manual_status?: "open" | "close";
}

export interface StoreUpdatePayload {
  name: string;

  manual_status: "open" | "close";
  image_url: string;
  banner_url: string;
}

export const getStores = async (
  store_id: number | string,
): Promise<Store[]> => {
  try {
    const res = await axiosInstance.get(`stores/`, {
      params: { store_id },
    });
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get Stores Error:", error);
    throw error;
  }
};

export const updateStore = async (
  store_id: number | string,
  payload: StoreUpdatePayload,
): Promise<Store> => {
  try {
    const res = await axiosInstance.put(`stores/${store_id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Store Error:", error);
    throw error;
  }
};
