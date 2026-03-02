// src/api/categoryAvailability.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CategoryAvailability {
  id: number;
  category_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
  isActive: boolean;
}

export interface CategoryAvailabilityPayload {
  category_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
  isActive: boolean;
}

// Grouped type — for display in table
export interface GroupedAvailability {
  id: number;
  category_id: number;
  start_time: string;
  end_time: string;
  isActive: boolean;
  days: number[];
  items: CategoryAvailability[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getCategoryAvailabilities = async (): Promise<
  CategoryAvailability[]
> => {
  try {
    const res = await axiosInstance.get("categories-availability/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Get Category Availabilities Error:", error);
    throw error;
  }
};

export const createBulkCategoryAvailabilities = async (
  payload: CategoryAvailabilityPayload[],
): Promise<void> => {
  try {
    await axiosInstance.post("categories-availability/bulk", payload);
  } catch (error) {
    console.error("Create Bulk Category Availabilities Error:", error);
    throw error;
  }
};

export const deleteCategoryAvailability = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`categories-availability/${id}`);
  } catch (error) {
    console.error("Delete Category Availability Error:", error);
    throw error;
  }
};
