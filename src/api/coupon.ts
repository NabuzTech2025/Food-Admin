import axiosInstance from "@/api/axiosConfig";

export interface Coupon {
  id: number;
  store_id: number;
  code: string;
  name: string;
  coupon_type: string;
  value: number | null;
  min_cart_amount: number | null;
  max_discount_amount: number | null;
  start_at: string | null;
  end_at: string | null;
  usage_limit: number | null;
  usage_per_user: number | null;
  is_active: boolean;
}

export interface CouponPayload {
  store_id: number;
  code: string;
  name: string;
  coupon_type: string;
  value?: number | null;
  min_cart_amount?: number | null;
  max_discount_amount?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  usage_limit?: number | null;
  usage_per_user?: number | null;
  is_active?: boolean;
}

export const getCoupons = async (store_id: number | string): Promise<Coupon[]> => {
  try {
    const res = await axiosInstance.get(`coupons/${store_id}?include_inactive=true`);
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get Coupons Error:", error);
    throw error;
  }
};

export const addCoupon = async (payload: CouponPayload): Promise<Coupon> => {
  try {
    const res = await axiosInstance.post("coupons", payload);
    return res.data;
  } catch (error) {
    console.error("Add Coupon Error:", error);
    throw error;
  }
};

export const updateCoupon = async (id: number, payload: CouponPayload): Promise<Coupon> => {
  try {
    const res = await axiosInstance.put(`coupons/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Coupon Error:", error);
    throw error;
  }
};

export const deleteCoupon = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`coupons/${id}`);
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    throw error;
  }
};

export const toggleCouponStatus = async (id: number, newStatus: boolean): Promise<void> => {
  try {
    const endpoint = newStatus ? `coupons/${id}/activate` : `coupons/${id}/deactivate`;
    await axiosInstance.patch(endpoint);
  } catch (error) {
    console.error("Toggle Coupon Status Error:", error);
    throw error;
  }
};
