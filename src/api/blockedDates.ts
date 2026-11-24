// src/api/blockedDates.ts
// Blocked dates for Reservation v2 + Booking v2.
// Blocks whole dates/ranges for bookings/reservations (ordering stays open).
// Backend endpoint: /booking-blocked-dates (GET is public; writes need owner token).
import axiosInstance from "./axiosConfig";

export type AppliesTo = "all" | "reservation" | "booking";

export interface BlockedDate {
  id: number;
  store_id: number;
  service_id: number | null; // Booking v2 only; null = all packages
  name: string | null;
  start_date: string; // yyyy-MM-dd
  end_date: string | null; // yyyy-MM-dd, null = single day (inclusive)
  applies_to: AppliesTo;
  is_active: boolean;
}

export interface CreateBlockedDatePayload {
  store_id: number;
  name?: string | null;
  start_date: string;
  end_date?: string | null;
  applies_to?: AppliesTo;
  service_id?: number | null;
  is_active?: boolean;
}

export type UpdateBlockedDatePayload = Partial<
  Omit<CreateBlockedDatePayload, "store_id">
>;

const PATH = "/booking-blocked-dates";

export const listBlockedDates = async (
  storeId: number,
  opts?: { fromDate?: string; includeInactive?: boolean },
): Promise<BlockedDate[]> => {
  const res = await axiosInstance.get<BlockedDate[]>(PATH, {
    params: {
      store_id: storeId,
      from_date: opts?.fromDate,
      include_inactive: opts?.includeInactive,
    },
  });
  return res.data;
};

export const createBlockedDate = async (
  payload: CreateBlockedDatePayload,
): Promise<BlockedDate> => {
  const res = await axiosInstance.post<BlockedDate>(PATH, payload);
  return res.data;
};

export const updateBlockedDate = async (
  id: number,
  payload: UpdateBlockedDatePayload,
): Promise<BlockedDate> => {
  const res = await axiosInstance.put<BlockedDate>(`${PATH}/${id}`, payload);
  return res.data;
};

export const deleteBlockedDate = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${PATH}/${id}`);
};
