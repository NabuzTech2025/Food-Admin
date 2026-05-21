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

  is_manual_override?: boolean;
  manual_status?: "open" | "close" | null;
  phone_numbers?: any[];
  number_of_tables?: number;
  use_distance_delivery?: boolean;
  created_at?: string;
  postcodes?: any[];
  store_hours?: any[];
  delivery_time_plans?: any[];
  collection_time_plans?: any[];
  printers?: any[];
  holidays?: any[];
  stripe_service_fee?: any;
  lieferung_enabled?: any;
}

export interface StoreUpdatePayload {
  name: string;

  is_manual_override?: boolean;
  manual_status: "open" | "close";
  image_url: string;
  banner_url: string;
}

export const getStores = async (
  store_id?: number | string | null,
): Promise<Store[]> => {
  try {
    const params = store_id ? { store_id } : {};
    const res = await axiosInstance.get(`stores/`, { params });
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
