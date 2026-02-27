// src/api/allergy.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Allergy {
  id: number;
  name: string;
  description: string;
  store_id: number;
}

export interface AllergyPayload {
  name: string;
  description: string;
  store_id: number | string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getAllergy = async (
  store_id: number | string,
): Promise<Allergy[]> => {
  try {
    const res = await axiosInstance.get(`allergy-items/?store_id=${store_id}`);
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get Allergy Error:", error);
    throw error;
  }
};

export const addAllergy = async (payload: AllergyPayload): Promise<Allergy> => {
  try {
    const res = await axiosInstance.post(`allergy-items/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Allergy Error:", error);
    throw error;
  }
};

export const updateAllergy = async (
  id: number,
  payload: AllergyPayload,
): Promise<Allergy> => {
  try {
    const res = await axiosInstance.put(`allergy-items/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Allergy Error:", error);
    throw error;
  }
};

export const deleteAllergy = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`allergy-items/${id}`);
  } catch (error) {
    console.error("Delete Allergy Error:", error);
    throw error;
  }
};
