// src/api/category.ts
import axiosInstance from "@/api/axiosConfig";

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
  display_order: number | null;
  isActive: boolean;
  store_id: number;
  tax?: {
    id: number;
    name: string;
    percentage: number;
  };
}

export interface CategoryPayload {
  name: string;
  store_id: number | string;
  tax_id: number | string | null;
  image_url: string;
  description: string;
  display_order: number | null;
  isActive: boolean;
}

export const getCategory = async (
  store_id: number | string,
): Promise<Category[]> => {
  try {
    const res = await axiosInstance.get(`categories/`, {
      params: { store_id },
    });
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get Category Error:", error);
    throw error;
  }
};

// src/api/category.ts — add these functions
export const addCategory = async (
  payload: CategoryPayload,
): Promise<Category> => {
  try {
    console.log("payload ==========>", payload);
    const res = await axiosInstance.post(`/categories/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Category Error:", error);
    throw error;
  }
};

// src/api/category.ts — add updateCategory
export const updateCategory = async (
  id: number,
  payload: CategoryPayload,
): Promise<Category> => {
  try {
    const res = await axiosInstance.put(`categories/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Category Error:", error);
    throw error;
  }
};
