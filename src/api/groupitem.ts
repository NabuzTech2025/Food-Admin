// src/api/groupItem.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GroupItem {
  id: number;
  display_order: number;
  topping_id: number;
  topping_group_id: number;
  topping?: { id: number; name: string; price: number };
  group?: { id: number; name: string };
}

export interface GroupItemPayload {
  topping_id: number;
  topping_group_id: number;
  display_order: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getGroupItem = async (
  store_id: number | string,
): Promise<GroupItem[]> => {
  try {
    const res = await axiosInstance.get(
      `toppings/group-items?store_id=${store_id}`,
    );
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get GroupItem Error:", error);
    throw error;
  }
};

export const addGroupItem = async (
  payload: GroupItemPayload,
): Promise<GroupItem> => {
  try {
    const res = await axiosInstance.post(`toppings/group-items`, payload);
    return res.data;
  } catch (error) {
    console.error("Add GroupItem Error:", error);
    throw error;
  }
};

export const updateGroupItem = async (
  id: number,
  payload: GroupItemPayload,
): Promise<GroupItem> => {
  try {
    const res = await axiosInstance.put(`toppings/group-items/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update GroupItem Error:", error);
    throw error;
  }
};

export const deleteGroupItem = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`toppings/group-items/${id}`);
  } catch (error) {
    console.error("Delete GroupItem Error:", error);
    throw error;
  }
};
