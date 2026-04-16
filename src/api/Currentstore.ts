// Types based on the /stores/13 response shape

import axiosInstance from "./axiosConfig";

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

export interface Store {
  id: number;
  name: string;
  address: string;
  country: string;
  image_url: string;
  banner_url: string;
  description: string;
  phone_numbers: string[];
  number_of_tables: number;
  is_manual_override: boolean;
  manual_status: string | null;
  use_distance_delivery: boolean;
  created_at: string;
  postcodes: string[];
  store_hours: StoreHour[];
  delivery_time_plans: DeliveryTimePlan[];
  collection_time_plans: CollectionTimePlan[];
  printers: Printer[];
  holidays: Holiday[];
  stripe_service_fee: number;
  lieferung_enabled: boolean;
}

// API function — hits /stores/13 and returns a single Store object
export const getCurrentStore = async (
  store_id: number | string,
): Promise<Store> => {
  try {
    const res = await axiosInstance.get<Store>(`stores/${store_id}`);
    return res.data;
  } catch (error) {
    console.error("Get Store Error:", error);
    throw error;
  }
};
