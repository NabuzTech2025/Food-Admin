// src/api/bookingV2.ts
// Booking v2 API — the service/event booking endpoints.
// Router prefix on the backend: /bookings/v2
import axiosInstance from "./axiosConfig";

export type BookingStatus = "pending" | "booked" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded" | string;

export interface BookingV2 {
  id: number;
  store_id: number;
  user_id: number | null;
  service_id: number;
  resource_id: number | null;
  reference: string;
  start_at: string;
  end_at: string;
  blocked_until: string | null;
  duration_minutes: number;
  party_size: number;
  units: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  note: string | null;
  form_data: Record<string, unknown> | null;
  selected_options: unknown | null;
  price_total: number | null;
  deposit_amount: number | null;
  currency: string;
  created_at: string;
}

export interface TodayBookingsResponse {
  date: string;
  store_ids: number[];
  summary: {
    total: number;
    pending: number;
    booked: number;
    cancelled: number;
    active_total: number;
    guests: number;
    revenue_booked: number;
    revenue_paid: number;
  };
  bookings: BookingV2[];
}

const V2 = "/bookings/v2";

export const getTodayBookings = async (
  storeId: number,
): Promise<TodayBookingsResponse> => {
  const res = await axiosInstance.get<TodayBookingsResponse>(
    `${V2}/store/today`,
    { params: { store_id: storeId } },
  );
  return res.data;
};

export interface FilterBookingsPayload {
  store_id: number;
  target_date: string; // yyyy-MM-dd
  limit?: number;
  offset?: number;
}

export const filterBookings = async (
  payload: FilterBookingsPayload,
): Promise<BookingV2[]> => {
  const res = await axiosInstance.post<BookingV2[]>(
    `${V2}/store/filter`,
    payload,
  );
  return res.data;
};

export const getBookingById = async (id: number): Promise<BookingV2> => {
  const res = await axiosInstance.get<BookingV2>(`${V2}/${id}`);
  return res.data;
};

export interface UpdateBookingPayload {
  status?: BookingStatus; // "booked" = confirm, "cancelled" = cancel
  start_at?: string; // move/edit
  party_size?: number;
  duration_minutes?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  note?: string;
  customer_message?: string; // one-shot line added to the status email
}

// PUT /bookings/v2/{id} — used for confirm, cancel, and move/edit.
export const updateBooking = async (
  id: number,
  payload: UpdateBookingPayload,
): Promise<BookingV2> => {
  const res = await axiosInstance.put<BookingV2>(`${V2}/${id}`, payload);
  return res.data;
};

// ── Services (packages) ────────────────────────────────────────
export interface ServiceOption {
  name: string;
  price_delta: number;
  price_mode: string;
  max_qty: number;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface ServiceHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface BookingService {
  id: number;
  store_id: number;
  resource_id: number | null;
  name: string;
  description: string | null;
  image_url: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  min_party: number;
  max_party: number;
  price_mode: string;
  price: number;
  deposit_amount: number | null;
  require_payment: boolean | null;
  slot_interval_minutes: number | null;
  lead_time_minutes: number | null;
  booking_window_days: number | null;
  is_active: boolean;
  sort_order: number;
  options: ServiceOption[];
  hours: ServiceHour[];
}

export interface CreateServicePayload {
  store_id: number;
  resource_id?: number | null;
  name: string;
  description?: string;
  image_url?: string;
  duration_minutes: number;
  buffer_minutes: number;
  min_party: number;
  max_party: number;
  price_mode: string;
  price: number;
  deposit_amount?: number | null;
  require_payment?: boolean;
  slot_interval_minutes?: number | null;
  lead_time_minutes?: number | null;
  booking_window_days?: number | null;
  options?: ServiceOption[];
  hours?: ServiceHour[];
  is_active: boolean;
  sort_order: number;
}

export type UpdateServicePayload = Partial<
  Omit<BookingService, "id" | "store_id">
>;

export const listServices = async (
  storeId: number,
  includeInactive = false,
): Promise<BookingService[]> => {
  const res = await axiosInstance.get<BookingService[]>(`${V2}/services`, {
    params: { store_id: storeId, include_inactive: includeInactive },
  });
  return res.data;
};

export const createService = async (
  payload: CreateServicePayload,
): Promise<BookingService> => {
  const res = await axiosInstance.post<BookingService>(
    `${V2}/services`,
    payload,
  );
  return res.data;
};

export const updateService = async (
  id: number,
  payload: UpdateServicePayload,
): Promise<BookingService> => {
  const res = await axiosInstance.put<BookingService>(
    `${V2}/services/${id}`,
    payload,
  );
  return res.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${V2}/services/${id}`);
};

// ── Resources (the stadium / chairs / rooms) ───────────────────
export type CapacityMode = "exclusive" | "pooled";

export interface Resource {
  id: number;
  store_id: number;
  name: string;
  capacity: number;
  capacity_mode: CapacityMode;
  is_active: boolean;
  sort_order: number;
}

export interface CreateResourcePayload {
  store_id: number;
  name: string;
  capacity: number;
  capacity_mode: CapacityMode;
  is_active: boolean;
  sort_order: number;
}

export type UpdateResourcePayload = Partial<
  Omit<Resource, "id" | "store_id">
>;

export const listResources = async (
  storeId: number,
): Promise<Resource[]> => {
  const res = await axiosInstance.get<Resource[]>(`${V2}/resources`, {
    params: { store_id: storeId },
  });
  return res.data;
};

export const createResource = async (
  payload: CreateResourcePayload,
): Promise<Resource> => {
  const res = await axiosInstance.post<Resource>(`${V2}/resources`, payload);
  return res.data;
};

export const updateResource = async (
  id: number,
  payload: UpdateResourcePayload,
): Promise<Resource> => {
  const res = await axiosInstance.put<Resource>(
    `${V2}/resources/${id}`,
    payload,
  );
  return res.data;
};

export const deleteResource = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${V2}/resources/${id}`);
};

// ── Availability & guest booking ───────────────────────────────
export interface AvailabilitySlot {
  time: string;
  datetime: string;
  available: number;
  total: number;
  bookable: boolean;
}

export interface ServiceAvailability {
  service_id: number;
  service_name: string;
  store_id: number;
  date: string;
  party_size: number;
  enabled: boolean;
  duration_minutes: number;
  reason: string | null;
  slots: AvailabilitySlot[];
}

export const getServiceAvailability = async (
  serviceId: number,
  date: string,
  partySize: number,
): Promise<ServiceAvailability> => {
  const res = await axiosInstance.get<ServiceAvailability>(`${V2}/availability`, {
    params: { service_id: serviceId, date, party_size: partySize },
  });
  return res.data;
};

export interface CreateGuestBookingPayload {
  store_id: number;
  service_id: number;
  start_at: string;
  party_size: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  note?: string;
  option_ids?: number[];
  form_data?: Record<string, unknown>;
}

export const createGuestBooking = async (
  payload: CreateGuestBookingPayload,
): Promise<BookingV2> => {
  const res = await axiosInstance.post<BookingV2>(`${V2}/guest`, payload);
  return res.data;
};

// ── Booking config (settings) ──────────────────────────────────
export interface BookingConfig {
  store_id: number;
  enabled: boolean;
  slot_interval_minutes: number;
  lead_time_minutes: number;
  booking_window_days: number;
  currency: string;
  require_payment: boolean;
  auto_accept: boolean;
}

export const getBookingConfig = async (
  storeId: number,
): Promise<BookingConfig> => {
  const res = await axiosInstance.get<BookingConfig>(`${V2}/config`, {
    params: { store_id: storeId },
  });
  return res.data;
};

export const updateBookingConfig = async (
  storeId: number,
  payload: Partial<Omit<BookingConfig, "store_id">>,
): Promise<BookingConfig> => {
  const res = await axiosInstance.put<BookingConfig>(`${V2}/config`, payload, {
    params: { store_id: storeId },
  });
  return res.data;
};
