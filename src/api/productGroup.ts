// src/api/productGroup.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProductGroup {
  id: number;
  product?: { id: number; name: string; type: string };
  group?: { id: number; name: string };
  topping_group_id?: number;
  product_id?: number;
}

export interface ProductVariantGroup {
  id: number;
  variant?: { id: number; name: string };
  parentProduct?: { id: number; name: string };
  group?: { id: number; name: string };
  variantId?: number;
  groupId?: number;
  originalProductId?: number;
}

export interface ProductGroupPayload {
  topping_group_id: number;
  product_id: number;
}

// ─── Product Group APIs ───────────────────────────────────────────────────────

export const getProductGroup = async (
  store_id: number | string,
): Promise<ProductGroup[]> => {
  try {
    const res = await axiosInstance.get(
      `toppings/product-groups?store_id=${store_id}`,
    );
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get ProductGroup Error:", error);
    throw error;
  }
};

export const addProductGroup = async (
  payload: ProductGroupPayload,
): Promise<ProductGroup> => {
  try {
    const res = await axiosInstance.post(`toppings/product-groups`, payload);
    return res.data;
  } catch (error) {
    console.error("Add ProductGroup Error:", error);
    throw error;
  }
};

export const updateProductGroup = async (
  id: number,
  payload: ProductGroupPayload,
): Promise<ProductGroup> => {
  try {
    const res = await axiosInstance.put(
      `toppings/product-groups/${id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.error("Update ProductGroup Error:", error);
    throw error;
  }
};

export const deleteProductGroup = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`toppings/product-groups/${id}`);
  } catch (error) {
    console.error("Delete ProductGroup Error:", error);
    throw error;
  }
};

// ─── Variant Group APIs ───────────────────────────────────────────────────────

export const addProductVariantGroup = async (
  payload: ProductGroupPayload,
): Promise<any> => {
  try {
    const res = await axiosInstance.post(`toppings/variant-groups`, payload);
    return res.data;
  } catch (error) {
    console.error("Add VariantGroup Error:", error);
    throw error;
  }
};

export const updateProductVariantGroup = async (
  id: number,
  payload: ProductGroupPayload,
): Promise<any> => {
  try {
    const res = await axiosInstance.put(
      `toppings/variant-groups/${id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.error("Update VariantGroup Error:", error);
    throw error;
  }
};

export const deleteProductVariantGroup = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`toppings/variant-groups/${id}`);
  } catch (error) {
    console.error("Delete VariantGroup Error:", error);
    throw error;
  }
};
