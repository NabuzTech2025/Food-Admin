import axiosInstance from "@/api/axiosConfig";

export interface PaymentSettings {
  cash_enabled: boolean;
  card_enabled: boolean;
  stripe_enabled: boolean;
  paypal_enabled: boolean;
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
