import axiosInstance from "./axiosConfig";

export interface ReservationItem {
  id: number;
  status: string;
  guest_count: number;
  reserved_for: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  note: string;
}

export interface StoreReservation {
  store_id: number;
  store_name: string;
  total: number;
  booked: number;
  pending: number;
  cancelled: number;
  reservations: ReservationItem[];
}

export interface ReservationsResponse {
  date: string;
  total: number;
  stores: StoreReservation[];
}

export const getSuperAdminReservations = async (date: string): Promise<ReservationsResponse> => {
  const response = await axiosInstance.get(`/superadmin/reservations/count?date=${date}`);
  return response.data;
};
