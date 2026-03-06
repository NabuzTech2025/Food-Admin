// src/api/inventory.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: number;
  product_id?: number;
  variant_id?: number;
  variant_name?: string;
  qty_on_hand: number;
  store_id: number;
}

export interface AdjustInventoryPayload {
  store_id: number;
  delta: number;
  product_id?: number;
  variant_id?: number;
}

export interface GetInventoryParams {
  store_id: number;
  product_id?: number | null;
  variant_id?: number | null;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getInventory = async ({
  store_id,
  product_id = null,
  variant_id = null,
}: GetInventoryParams): Promise<InventoryItem[]> => {
  try {
    const res = await axiosInstance.get("/inventory/", {
      params: { store_id, product_id, variant_id },
    });
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.items)) return res.data.items;
    return [];
  } catch (error) {
    console.error("Get Inventory Error:", error);
    throw error;
  }
};

export const adjustInventory = async (
  payload: AdjustInventoryPayload,
): Promise<void> => {
  try {
    await axiosInstance.post("/inventory/adjust", payload);
  } catch (error) {
    console.error("Adjust Inventory Error:", error);
    throw error;
  }
};

export const bulkSetInventory = async (payload: any): Promise<void> => {
  try {
    await axiosInstance.post("/inventory/bulk/set", payload);
  } catch (error) {
    console.error("Bulk Set Inventory Error:", error);
    throw error;
  }
};
