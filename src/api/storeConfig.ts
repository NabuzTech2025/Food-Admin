import axiosInstance from "@/api/axiosConfig";

export interface FooterItem {
  label: string;
  link: string;
}

export type Language = "en" | "de";

export interface StoreConfig {
  domain: string;
  store_id: number;
  app_name: string;
  app_base_route: string;
  copyright_text: string;
  footer: FooterItem[] | string | null;
  country: string;
  paypal_live_client_id: string | null;
  use_distance_delivery: boolean;
}

export interface StoreConfigCreatePayload {
  domain: string;
  store_id: number;
  app_name: string;
  app_base_route: string;
  copyright_text: string;
  footer?: FooterItem[] | string | null;
  language: Language;
}

export interface StoreConfigUpdatePayload {
  domain: string;
  store_id: number;
  app_name: string;
  app_base_route: string;
  copyright_text: string;
  footer?: FooterItem[];
  language: Language;
}

export const getStoreConfigs = async (params: {
  limit?: number;
  offset?: number;
}): Promise<StoreConfig[]> => {
  try {
    const res = await axiosInstance.get("store-domain-config", { params });
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get StoreConfigs Error:", error);
    throw error;
  }
};

export const createStoreConfig = async (
  payload: StoreConfigCreatePayload,
): Promise<StoreConfig> => {
  try {
    const res = await axiosInstance.post("store-domain-config", payload);
    return res.data;
  } catch (error) {
    console.error("Create StoreConfig Error:", error);
    throw error;
  }
};

export const updateStoreConfig = async (
  domain: string,
  payload: StoreConfigUpdatePayload,
): Promise<StoreConfig> => {
  try {
    const res = await axiosInstance.put(
      `store-domain-config/${domain}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.error("Update StoreConfig Error:", error);
    throw error;
  }
};
