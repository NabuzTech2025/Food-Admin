// src/api/discount.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Discount {
  id: number;
  code: "DELIVERY_DISCOUNT" | "PICKUP_DISCOUNT";
  type: string;
  value: number;
  expires_at: string;
  store_id: number;
}

export interface DiscountPayload {
  code: string;
  type: string;
  value: number;
  expires_at: string;
  store_id: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getDiscounts = async (
  store_id: number | string,
): Promise<Discount[]> => {
  try {
    const res = await axiosInstance.get(`discounts/${store_id}`);
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get Discounts Error:", error);
    throw error;
  }
};

export const addDiscount = async (
  payload: DiscountPayload,
): Promise<Discount> => {
  try {
    const res = await axiosInstance.post("discounts/", payload);
    return res.data;
  } catch (error) {
    console.error("Add Discount Error:", error);
    throw error;
  }
};

export const updateDiscount = async (
  id: number,
  payload: DiscountPayload,
): Promise<Discount> => {
  try {
    const res = await axiosInstance.put(`discounts/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Discount Error:", error);
    throw error;
  }
};
