import axiosInstance from "./axiosConfig";

export interface TaxBreakdown {
  [taxName: string]: number;
}

export interface PaymentMethods {
  [methodName: string]: number;
}

export interface OrderTypes {
  delivery: number;
  pickup: number;
  dine_in: number;
}

export interface ApprovalStatuses {
  pending: number;
  accepted: number;
  declined: number;
}

export interface DashboardReport {
  total_sales: number;
  total_orders: number;
  cash_total: number;
  online_total: number;
  discount_total: number;
  delivery_total: number;
  total_tax: number;
  net_total: number;
  tax_breakdown: TaxBreakdown;
  payment_methods: PaymentMethods;
  order_types: OrderTypes;
  approval_statuses: ApprovalStatuses;
  top_items: unknown[];
  by_category: Record<string, unknown>;
  "total_sales + delivery": number;
  detailed_orders: unknown[];
}

export const getDashboardReport = async (): Promise<DashboardReport> => {
  try {
    const res = await axiosInstance.get(`reports/today`);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("Get Dashboard Report Error:", error);
    throw error;
  }
};
