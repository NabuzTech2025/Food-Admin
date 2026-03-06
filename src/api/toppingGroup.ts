// src/api/toppingGroup.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ToppingGroup {
  id: number;
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  isActive: boolean;
  store_id: number;
}

export interface ToppingGroupPayload {
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  store_id: number | string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getToppingGroup = async (store_id: number | string): Promise<ToppingGroup[]> => {
  try {
    const res = await axiosInstance.get(`toppings/groups?store_id=${store_id}`);
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get ToppingGroup Error:", error);
    throw error;
  }
};

export const addToppingGroup = async (payload: ToppingGroupPayload): Promise<ToppingGroup> => {
  try {
    const res = await axiosInstance.post(`toppings/groups`, payload);
    return res.data;
  } catch (error) {
    console.error("Add ToppingGroup Error:", error);
    throw error;
  }
};

export const updateToppingGroup = async (id: number, payload: ToppingGroupPayload): Promise<ToppingGroup> => {
  try {
    const res = await axiosInstance.put(`toppings/groups/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update ToppingGroup Error:", error);
    throw error;
  }
};

export const deleteToppingGroup = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`toppings/groups/${id}`);
  } catch (error) {
    console.error("Delete ToppingGroup Error:", error);
    throw error;
  }
};

export const reactivateToppingGroup = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(`toppings/groups/${id}/reactivate`);
  } catch (error) {
    console.error("Reactivate ToppingGroup Error:", error);
    throw error;
  }
};