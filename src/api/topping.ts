// src/api/topping.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Topping {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  store_id: number;
}

export interface ToppingPayload {
  name: string;
  description: string;
  price: number;
  store_id: number | string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getTopping = async (store_id: number | string): Promise<Topping[]> => {
  try {
    const res = await axiosInstance.get(`toppings/?store_id=${store_id}`);
    console.log("Topping API response:", res.data); // debug — baad mein hata dena
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get Topping Error:", error);
    throw error;
  }
};

export const addTopping = async (payload: ToppingPayload): Promise<Topping> => {
  try {
    const res = await axiosInstance.post(`toppings/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Topping Error:", error);
    throw error;
  }
};

export const updateTopping = async (id: number, payload: ToppingPayload): Promise<Topping> => {
  try {
    const res = await axiosInstance.put(`toppings/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Topping Error:", error);
    throw error;
  }
};

export const deleteTopping = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`toppings/${id}`);
  } catch (error) {
    console.error("Delete Topping Error:", error);
    throw error;
  }
};

export const reactivateTopping = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(`toppings/${id}/reactivate`);
  } catch (error) {
    console.error("Reactivate Topping Error:", error);
    throw error;
  }
};