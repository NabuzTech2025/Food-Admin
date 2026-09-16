import axiosInstance from "@/api/axiosConfig";

export interface PaymentSettings {
  cash_enabled: boolean;
  card_enabled: boolean;
  stripe_enabled: boolean;
  paypal_enabled: boolean;
  ec_enabled: boolean;
  store_id: number | string;
}

export interface PaymentSettingsResponse extends PaymentSettings {
  id: number;
}

export const getPaymentSettings = async (
  store_id: number | string,
): Promise<PaymentSettingsResponse> => {
  const res = await axiosInstance.get(`store-payment-settings/${store_id}`);
  return res.data;
};

export const createPaymentSettings = async (
  payload: PaymentSettings,
): Promise<PaymentSettingsResponse> => {
  const res = await axiosInstance.post("store-payment-settings/", payload);
  return res.data;
};

export const updatePaymentSettings = async (
  id: number,
  payload: PaymentSettings,
): Promise<PaymentSettingsResponse> => {
  const res = await axiosInstance.put(
    `store-payment-settings/${id}`,
    payload,
  );
  return res.data;
};

// ── Per-order-type settings ──

export type OrderTypeName = "delivery" | "collection" | "dine_in";

export type PaymentFlags = Omit<PaymentSettings, "store_id">;

export interface OrderTypeSettings {
  store_id: number;
  order_type: number;
  order_type_name: OrderTypeName;
  is_override: boolean;
  flags: PaymentFlags;
}

export const getOrderTypeSettings = async (
  store_id: number | string,
): Promise<OrderTypeSettings[]> => {
  const res = await axiosInstance.get(
    `store-payment-settings/${store_id}/order-types`,
  );
  return res.data;
};

export const updateOrderTypeSettings = async (
  store_id: number | string,
  order_type: OrderTypeName,
  flags: Partial<PaymentFlags>,
): Promise<OrderTypeSettings> => {
  const res = await axiosInstance.put(
    `store-payment-settings/${store_id}/order-types/${order_type}`,
    flags,
  );
  return res.data;
};

export const resetOrderTypeSettings = async (
  store_id: number | string,
  order_type: OrderTypeName,
): Promise<OrderTypeSettings> => {
  const res = await axiosInstance.delete(
    `store-payment-settings/${store_id}/order-types/${order_type}`,
  );
  return res.data;
};
