// src/api/deliveryTimePlan.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DeliveryTimePlan {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  store_id: number;
  name: string;
}

export interface DeliveryTimePlanPayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
  store_id: number;
  name: string;
}

export interface GroupedDeliveryTimePlan {
  start_time: string;
  end_time: string;
  days: number[];
  ids: number[];
  names: string[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getDeliveryTimePlans = async (
  store_id: number | string,
): Promise<DeliveryTimePlan[]> => {
  try {
    const res = await axiosInstance.get(`/time-plans/delivery/store/${store_id}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Get Delivery Time Plans Error:", error);
    throw error;
  }
};

export const bulkCreateDeliveryTimePlans = async (
  store_id: number | string,
  payload: DeliveryTimePlanPayload[],
): Promise<DeliveryTimePlan[]> => {
  try {
    const res = await axiosInstance.post(
      `/time-plans/delivery/store/${store_id}/bulk`,
      payload,
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Bulk Create Delivery Time Plans Error:", error);
    throw error;
  }
};

export const updateDeliveryTimePlan = async (
  id: number,
  payload: DeliveryTimePlanPayload,
): Promise<DeliveryTimePlan> => {
  try {
    const res = await axiosInstance.put(`/time-plans/delivery/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Delivery Time Plan Error:", error);
    throw error;
  }
};

export const deleteDeliveryTimePlan = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/time-plans/delivery/${id}`);
  } catch (error) {
    console.error("Delete Delivery Time Plan Error:", error);
    throw error;
  }
};