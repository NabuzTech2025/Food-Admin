import axiosInstance from "@/api/axiosConfig";
import type { CouponColor } from "@/constants/themePalettes";

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border?: string;
}

export interface StoreTheme {
  colors: ThemeColors;
  coupons: {
    percent: CouponColor;
    amount: CouponColor;
    delivery: CouponColor;
  };
  store_id: number;
}

// Public, no token needed. Returns default colours if none saved yet.
export const getStoreTheme = async (
  store_id: number | string,
): Promise<StoreTheme> => {
  const res = await axiosInstance.get(`store-theme/${store_id}`);
  return res.data;
};

// Admin/restaurant token (sent automatically by axios interceptor).
export const saveStoreTheme = async (
  payload: StoreTheme,
): Promise<StoreTheme> => {
  const res = await axiosInstance.post(`store-theme/`, payload);
  return res.data;
};
