// src/api/storeSettings.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface StoreHour {
  id: number;
  name: string;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  store_id: number;
}

export interface StoreHourPayload {
  name: string;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  store_id: number;
}

export interface GroupedStoreHour {
  name: string;
  opening_time: string;
  closing_time: string;
  days: number[];
  ids: number[];
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  store_id: number;
}

export interface HolidayPayload {
  name: string;
  date: string;
  store_id: number;
}

// ─── Store Hours ──────────────────────────────────────────────────────────────

export const getStoreHours = async (
  store_id: number | string,
): Promise<StoreHour[]> => {
  try {
    const res = await axiosInstance.get(`store-hours/store/${store_id}`);
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get Store Hours Error:", error);
    throw error;
  }
};

export const addStoreHour = async (
  store_id: number | string,
  payload: StoreHourPayload,
): Promise<StoreHour> => {
  try {
    const res = await axiosInstance.post(
      `store-hours/store/${store_id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.error("Add Store Hour Error:", error);
    throw error;
  }
};

export const updateStoreHour = async (
  id: number,
  payload: Partial<StoreHourPayload>,
): Promise<StoreHour> => {
  try {
    const res = await axiosInstance.put(`store-hours/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Store Hour Error:", error);
    throw error;
  }
};

export const deleteStoreHour = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`store-hours/${id}`);
  } catch (error) {
    console.error("Delete Store Hour Error:", error);
    throw error;
  }
};

// ─── Holidays ─────────────────────────────────────────────────────────────────

export const getHolidays = async (
  store_id: number | string,
): Promise<Holiday[]> => {
  try {
    const res = await axiosInstance.get(`holidays/?store_id=${store_id}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Get Holidays Error:", error);
    throw error;
  }
};

export const addHoliday = async (payload: HolidayPayload): Promise<Holiday> => {
  try {
    const res = await axiosInstance.post("holidays/", payload);
    return res.data;
  } catch (error) {
    console.error("Add Holiday Error:", error);
    throw error;
  }
};

export const updateHoliday = async (
  id: number,
  payload: HolidayPayload,
): Promise<Holiday> => {
  try {
    const res = await axiosInstance.put(`holidays/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Holiday Error:", error);
    throw error;
  }
};

export const deleteHoliday = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`holidays/${id}`);
  } catch (error) {
    console.error("Delete Holiday Error:", error);
    throw error;
  }
};
