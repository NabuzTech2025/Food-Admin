import axiosInstance from "@/api/axiosConfig";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_id: number | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  note: string;
  tax: number;
  toppings: {
    topping_id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface Order {
  id: number;
  order_number: number;
  source: string;
  order_type: number;
  coupon_code: string | null;
  order_status: number;
  approval_status: number;
  note: string;
  delivery_time: string;
  created_at: string;
  store_id: number;
  isActive: boolean;
  user: {
    id: number;
    username: string;
    role_id: number;
    store_id: number | null;
  } | null;
  items: OrderItem[];
  discount: {
    id: number;
    code: string;
    type: string;
    value: number;
    expires_at: string;
    store_id: number;
  } | null;
  invoice: {
    id: number;
    invoice_number: string;
    total_amount: number;
    delivery_fee: number;
    discount_amount: number;
    issued_at: string;
    store_id: number;
    order_id: number;
  } | null;
  payment: {
    id: number;
    payment_method: string;
    status: string;
    paid_at: string;
    amount: number;
    order_id: number;
  } | null;
  shipping_address: {
    id: number;
    type: string;
    line1: string;
    city: string;
    zip: string;
    country: string;
    phone: string;
    customer_name: string;
    user_id: number;
  } | null;
  guest_shipping_json: {
    customer_name: string;
    email: string;
    phone: string;
    line1: string;
    city: string;
    zip: string;
    country: string;
    type: string;
  } | null;
  tax_summary: { tax_rate: number; tax_amount: number }[];
  brutto_netto_summary: {
    tax_rate: number;
    brutto: number;
    netto: number;
    tax_amount: number;
  }[];
}

export interface OrderFilterParams {
  store_id: number | string;
  target_date: string;
  offset: number;
}

export interface AdminOrder extends Order {
  store_name?: string;
}

export interface AdminOrdersParams {
  limit?: number;

  include_past?: boolean;

  start_date?: string;

  end_date?: string;
}

export const getOrders = async (
  params: OrderFilterParams,
): Promise<Order[]> => {
  try {
    const res = await axiosInstance.post(`orders/store/filter`, params);
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get Orders Error:", error);
    throw error;
  }
};

export const getAdminOrders = async ({
  limit = 60,
  include_past = false,
  start_date,
  end_date,
}: AdminOrdersParams): Promise<AdminOrder[]> => {
  try {
    const res = await axiosInstance.get(`orders/admin/list`, {
      params: {
        limit,
        include_past,
        start_date,
        end_date,
      },
    });

    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  } catch (error) {
    console.error("Get Admin Orders Error:", error);

    throw error;
  }
};
