// src/api/customer.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CustomerOrder {
  order_id: number;
  order_number: number;
  order_date: string;
}

export interface Customer {
  id: number;
  store_id: number;
  user_id: number | null;
  customer_name: string;
  email: string | null;
  phone: string;
  customer_type: "guest" | "registered";
  first_order_date: string | null;
  last_order_date: string | null;
  total_orders: number;
  first_reservation_date: string | null;
  last_reservation_date: string | null;
  total_reservations: number | null;
  created_at: string;
  updated_at: string;
  orders: CustomerOrder[];
  reservations: any[];
}

export interface CustomersResponse {
  total: number;
  limit: number;
  offset: number;
  filters: {
    customer_type: string | null;
    has_orders: boolean | null;
    has_reservations: boolean | null;
  };
  customers: Customer[];
}

export interface GetCustomersParams {
  store_id: number | string;
  limit?: number;
  offset?: number;
  customer_type?: string | null;
  has_orders?: boolean | null;
  has_reservations?: boolean | null;
  search?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const getCustomers = async (
  params: GetCustomersParams,
): Promise<CustomersResponse> => {
  try {
    const res = await axiosInstance.get("customers/", { params });
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("Get Customers Error:", error);
    throw error;
  }
};
