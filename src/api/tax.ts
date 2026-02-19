import axiosInstance from "@/api/axiosConfig";

export interface Tax {
  id: number;
  name: string;
  percentage: number;
  store_id: number;
}

export interface TaxPayload {
  name: string;
  percentage: number;
  store_id: number | string;
}

// src/api/AdminServices.ts
export const getTax = async (store_id: number | string): Promise<Tax[]> => {
  try {
    const res = await axiosInstance.get(`taxes/${store_id}`);

    // handle both { data: [] } and direct []
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get Tax List Error:", error);
    throw error;
  }
};

export const addTax = async (payload: TaxPayload): Promise<Tax> => {
  try {
    const res = await axiosInstance.post(`taxes/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Tax Error:", error);
    throw error;
  }
};

export const updateTax = async (
  id: number,
  payload: TaxPayload,
): Promise<Tax> => {
  try {
    const res = await axiosInstance.put(`taxes/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Tax Error:", error);
    throw error;
  }
};

export const deleteTax = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`taxes/${id}`);
  } catch (error) {
    console.error("Delete Tax Error:", error);
    throw error;
  }
};
