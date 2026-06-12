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

export interface ReservationDetail {
  store_id: number;
  user_id: number;
  guest_count: number;
  reserved_for: string;
  reserved_until: string;
  status: string;
  table_number: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  note: string;
  isActive: boolean;
  id: number;
  created_at: string;
  user: {
    username: string;
    id: number;
    store_id: number | null;
    role_id: number;
  };
}

export const getReservationDetails = async (id: number): Promise<ReservationDetail> => {
  const response = await axiosInstance.get(`/reservations/${id}`);
  return response.data;
};

export interface FilterStoreReservationsPayload {
  store_id: number;
  target_date: string;
  limit?: number;
  offset?: number;
}

export const filterStoreReservations = async (payload: FilterStoreReservationsPayload): Promise<ReservationDetail[]> => {
  const response = await axiosInstance.post('/reservations/store/filter', payload);
  return response.data;
};
