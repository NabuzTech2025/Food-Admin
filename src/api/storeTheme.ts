import axiosInstance from "@/api/axiosConfig";
import type { ColorPalette, CouponColor } from "@/constants/themePalettes";

export interface ThemeColors {
  primary: string;
  secondary?: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  "text-secondary"?: string;
  icons?: string;
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

// Public, no token needed. Super-admin-managed presets, sorted by the backend.
export const getThemePresets = async (): Promise<ColorPalette[]> => {
  const res = await axiosInstance.get(`themes/`);
  return res.data;
};

// Super-admin only (token sent automatically by the axios interceptor).
export const createThemePreset = async (
  payload: ColorPalette,
): Promise<ColorPalette> => {
  const res = await axiosInstance.post(`superadmin/themes/`, payload);
  return res.data;
};

export const updateThemePreset = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<ColorPalette>;
}): Promise<ColorPalette> => {
  const res = await axiosInstance.put(`superadmin/themes/${id}`, payload);
  return res.data;
};

export const deleteThemePreset = async (id: string): Promise<void> => {
  await axiosInstance.delete(`superadmin/themes/${id}`);
};

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
