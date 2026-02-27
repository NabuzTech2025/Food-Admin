// src/api/itemAllergy.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AllergyProductLink {
  id: string; // composite: `${product_id}-${allergy_item_id}`
  product_id: number;
  allergy_id: number;
  product: string; // product_name
  allergy: string; // allergy_name
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getAllergyProductLinks = async (
  store_id: number | string,
): Promise<AllergyProductLink[]> => {
  try {
    const res = await axiosInstance.get(
      `allergies_link/store/${store_id}/allergy-product`,
      { params: { include_unlinked: false, limit: 500, offset: 0 } },
    );
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map((item: any) => ({
      id: `${item.product_id}-${item.allergy_item_id}`,
      product_id: item.product_id,
      allergy_id: item.allergy_item_id,
      product: item.product_name,
      allergy: item.allergy_name,
    }));
  } catch (error) {
    console.error("Get Allergy Product Links Error:", error);
    throw error;
  }
};

export const addAllergyToProduct = async (
  product_id: number,
  allergy_item_id: number,
): Promise<void> => {
  try {
    await axiosInstance.post(`allergies_link/${product_id}/allergy-items`, [
      allergy_item_id,
    ]);
  } catch (error) {
    console.error("Add Allergy To Product Error:", error);
    throw error;
  }
};

export const removeAllergyFromProduct = async (
  product_id: number,
  allergy_item_id: number,
): Promise<void> => {
  try {
    await axiosInstance.delete(
      `allergies_link/${product_id}/allergy-items/${allergy_item_id}`,
    );
  } catch (error) {
    console.error("Remove Allergy From Product Error:", error);
    throw error;
  }
};
