// src/api/reservationV2.ts
// Reservation v2 API — the covers-based table booking endpoints.
// Router prefix on the backend: /reservations/v2  (see docs/API_GUIDE.pdf)
import axiosInstance from "./axiosConfig";

export type ReservationStatus = "pending" | "booked" | "cancelled";

export interface ReservationConfig {
  store_id: number;
  enabled: boolean;
  max_covers: number;
  slot_interval_minutes: number;
  default_duration_minutes: number;
  max_party_size: number;
  lead_time_minutes: number;
  booking_window_days: number;
}

export interface ReservationV2 {
  id: number;
  store_id: number;
  user_id: number | null;
  party_size: number;
  reserved_for: string; // naive Berlin wall-clock ISO
  reserved_until: string;
  duration_minutes: number;
  status: ReservationStatus;
  table_number: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  note: string | null;
  created_at: string;
}

export interface AvailabilitySlot {
  time: string;
  datetime: string;
  available: number;
  total: number;
  bookable: boolean;
}

export interface AvailabilityResponse {
  store_id: number;
  date: string;
  party_size: number;
  enabled: boolean;
  reason: string | null;
  slots: AvailabilitySlot[];
}

const V2 = "/reservations/v2";

// ── Configuration ──────────────────────────────────────────────
export const getReservationConfig = async (
  storeId: number,
): Promise<ReservationConfig> => {
  const res = await axiosInstance.get(`${V2}/config`, {
    params: { store_id: storeId },
  });
  return res.data;
};

export const updateReservationConfig = async (
  storeId: number,
  payload: Partial<Omit<ReservationConfig, "store_id">>,
): Promise<ReservationConfig> => {
  const res = await axiosInstance.put(`${V2}/config`, payload, {
    params: { store_id: storeId },
  });
  return res.data;
};

// ── Availability (public) ──────────────────────────────────────
export const getAvailability = async (
  storeId: number,
  date: string,
  partySize = 2,
): Promise<AvailabilityResponse> => {
  const res = await axiosInstance.get(`${V2}/availability`, {
    params: { store_id: storeId, date, party_size: partySize },
  });
  return res.data;
};

// ── Manage reservations (staff) ────────────────────────────────
export const getTodayReservations = async (
  storeId: number,
): Promise<ReservationV2[]> => {
  const res = await axiosInstance.get(`${V2}/store/today`, {
    params: { store_id: storeId },
  });
  return res.data;
};

export interface FilterReservationsPayload {
  store_id: number;
  target_date: string;
  limit?: number;
  offset?: number;
}

export const filterReservations = async (
  payload: FilterReservationsPayload,
): Promise<ReservationV2[]> => {
  const res = await axiosInstance.post(`${V2}/store/filter`, payload);
  return res.data;
};

export const getReservationById = async (
  id: number,
): Promise<ReservationV2> => {
  const res = await axiosInstance.get(`${V2}/${id}`);
  return res.data;
};

export interface UpdateReservationPayload {
  status?: ReservationStatus; // "booked" = accept, "cancelled" = decline
  party_size?: number;
  reserved_for?: string;
  duration_minutes?: number; // extend a big party
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  note?: string;
  isActive?: boolean;
  customer_message?: string; // one-shot line added to the status email
}

export const updateReservation = async (
  id: number,
  payload: UpdateReservationPayload,
): Promise<ReservationV2> => {
  const res = await axiosInstance.put(`${V2}/${id}`, payload);
  return res.data;
};

export interface CreateReservationPayload {
  store_id: number;
  party_size: number;
  reserved_for: string;
  duration_minutes?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  note?: string;
}

export const createReservation = async (
  payload: CreateReservationPayload,
): Promise<ReservationV2> => {
  const res = await axiosInstance.post(`${V2}/`, payload);
  return res.data;
};

// Hard-delete. Prefer updateReservation({status:"cancelled"}) to keep the record.
export const deleteReservation = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${V2}/${id}`);
};
