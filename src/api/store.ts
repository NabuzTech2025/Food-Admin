import axiosInstance from "@/api/axiosConfig";

export interface StoreHour {
  id: number;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  store_id: number;
  name: string;
}

export interface DeliveryTimePlan {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  store_id: number;
  name: string;
}

export interface CollectionTimePlan {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  store_id: number;
  name: string;
}

export interface Printer {
  id: number;
  name: string;
  ip_address: string;
  store_id: number;
  isActive: boolean;
  type: number;
  category_id: number | null;
  isRemote: boolean;
}

export interface Holiday {
  id: number;
  date: string;
  store_id: number;
  name: string;
}

export interface StoreDetail {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  logo?: string;
  banner_url?: string;
  banner?: string;
  address?: string;
  country?: string;
  phone_numbers?: any[];
  number_of_tables?: number;
  is_manual_override?: boolean;
  manual_status?: "open" | "close" | null;
  use_distance_delivery?: boolean;
  created_at?: string;
  postcodes?: any[];
  store_hours?: StoreHour[];
  delivery_time_plans?: DeliveryTimePlan[];
  collection_time_plans?: CollectionTimePlan[];
  printers?: Printer[];
  holidays?: Holiday[];
  stripe_service_fee?: number;
  lieferung_enabled?: boolean;
  abholung_enabled?: boolean;
}

export const getStoreById = async (
  storeId: number | string,
): Promise<StoreDetail> => {
  try {
    const res = await axiosInstance.get(`stores/${storeId}`);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("Get Store By ID Error:", error);
    throw error;
  }
};
