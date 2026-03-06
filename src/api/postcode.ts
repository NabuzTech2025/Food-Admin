// src/api/postcode.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Postcode {
  id: number;
  postcode: string;
  minimum_order_amount: number;
  delivery_fee: number;
  delivery_time: number;
  store_id: number;
}

export interface PostcodePayload {
  postcode: string;
  minimum_order_amount: number;
  delivery_fee: number;
  delivery_time: number;
  store_id: number | string;
}

export interface PostcodeUpdatePayload {
  id: number;
  postcode: string;
  minimum_order_amount: number;
  delivery_fee: number;
  delivery_time: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getPostcodesByStore = async (
  store_id: number | string,
): Promise<Postcode[]> => {
  try {
    const res = await axiosInstance.get(`/postcodes/store/${store_id}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Get Postcodes Error:", error);
    throw error;
  }
};

export const addPostcodes = async (
  payload: PostcodePayload[],
): Promise<Postcode[]> => {
  try {
    const res = await axiosInstance.post("/postcodes/", payload);
    return res.data;
  } catch (error) {
    console.error("Add Postcode Error:", error);
    throw error;
  }
};

export const updatePostcodes = async (
  payload: PostcodeUpdatePayload[],
): Promise<Postcode[]> => {
  try {
    const res = await axiosInstance.put("/postcodes/", payload);
    return res.data;
  } catch (error) {
    console.error("Update Postcodes Error:", error);
    throw error;
  }
};

export const deletePostcode = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/postcodes/${id}`);
  } catch (error) {
    console.error("Delete Postcode Error:", error);
    throw error;
  }
};
