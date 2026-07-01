import axiosInstance from "@/api/axiosConfig";

export interface StoreSettings {
  id?: number;
  store_id: number | string;

  auto_accept_orders_remote: boolean;
  auto_print_orders_remote: boolean;

  auto_accept_orders_local: boolean;
  auto_print_orders_local: boolean;

  auto_accept_reservations: boolean;

  stripe_service_fee: number;

  lieferung_enabled: boolean;
  abholung_enabled: boolean;

  is_kasse_integrated: boolean;
  is_windows_app: boolean;

  default_collection_time: number;
}

export type StoreSettingsPayload = Omit<StoreSettings, "id">;

// Get Store Settings
export const getStoreSettings = async (
  storeId: number | string,
): Promise<StoreSettings> => {
  try {
    const res = await axiosInstance.get(`store-settings/${storeId}`);
    return res.data;
  } catch (error) {
    console.error("Get Store Settings Error:", error);
    throw error;
  }
};

export interface BasicStoreSettingsPayload {
  store_id: number;
  auto_accept_orders_remote: boolean;
  auto_print_orders_remote: boolean;
  auto_accept_orders_local: boolean;
  auto_print_orders_local: boolean;
  auto_accept_reservations: boolean;
}

// Create Basic Store Settings (called after store config creation)
export const addBasicStoreSettings = async (
  payload: BasicStoreSettingsPayload,
): Promise<StoreSettings> => {
  try {
    const res = await axiosInstance.post(`store-settings/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Basic Store Settings Error:", error);
    throw error;
  }
};

// Create Store Settings
export const addStoreSettings = async (
  payload: StoreSettingsPayload,
): Promise<StoreSettings> => {
  try {
    const res = await axiosInstance.post(`store-settings/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Store Settings Error:", error);
    throw error;
  }
};

// Update Store Settings
export const updateStoreSettings = async (
  id: number,
  payload: StoreSettings,
): Promise<StoreSettings> => {
  try {
    const res = await axiosInstance.put(`store-settings/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Store Settings Error:", error);
    throw error;
  }
};
