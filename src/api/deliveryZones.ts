// src/api/deliveryZones.ts
import axiosInstance from "@/api/axiosConfig";

export interface DeliveryZone {
  id: number;
  store_id: number;
  min_distance: number;
  max_distance: number;
  minimum_order_amount: number;
  delivery_fee: number;
  delivery_time: number;
  is_active: boolean;
  created_at: string;
}

export interface DeliveryZonePayload {
  store_id: number | string;
  min_distance: number;
  max_distance: number;
  minimum_order_amount: number;
  delivery_fee: number;
  delivery_time: number;
  is_active: boolean;
}

export const getDeliveryZones = async (
  store_id: number | string,
): Promise<DeliveryZone[]> => {
  try {
    const res = await axiosInstance.get(`delivery-zones/store/${store_id}`, {
      params: { include_inactive: true },
    });
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get Delivery Zones Error:", error);
    throw error;
  }
};

export const addDeliveryZone = async (
  payload: DeliveryZonePayload,
): Promise<DeliveryZone> => {
  try {
    const res = await axiosInstance.post(`delivery-zones/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Delivery Zone Error:", error);
    throw error;
  }
};

export const updateDeliveryZone = async (
  id: number,
  payload: DeliveryZonePayload,
): Promise<DeliveryZone> => {
  try {
    const res = await axiosInstance.put(`delivery-zones/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Delivery Zone Error:", error);
    throw error;
  }
};

export const deleteDeliveryZone = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`delivery-zones/${id}`);
  } catch (error) {
    console.error("Delete Delivery Zone Error:", error);
    throw error;
  }
};
