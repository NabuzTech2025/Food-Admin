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

// types
export interface TopItem {
  name: string;
  qty: number;
  revenue: number;
}

export interface DetailedOrder {
  invoice_number: string;
  order_type: string;
  total: number;
}

export interface ReportData {
  total_sales: number;
  total_orders: number;
  cash_total: number;
  online_total: number;
  discount_total: number;
  delivery_total: number;
  total_tax: number;
  net_total: number;
  tax_breakdown: Record<string, number>;
  payment_methods: Record<string, number>;
  order_types: {
    delivery: number;
    pickup: number;
    dine_in: number;
  };
  approval_statuses: {
    pending: number;
    accepted: number;
    declined: number;
  };
  top_items: TopItem[];
  by_category: Record<string, number>;
  "total_sales + delivery": number;
  detailed_orders: DetailedOrder[];
}

export interface DailyReport {
  id: number;
  store_id: number;
  type: string;
  start_date: string;
  end_date: string;
  is_manual: boolean;
  note: string;
  unique_key: string;
  data: ReportData;
  total_sales: number;
  total_orders: number;
  total_tax: number;
  cash_total: number;
  online_total: number;
  generated_by: number;
  generated_at: string;
}

// api — add this to dashboard_report.ts

export const getAllReports = async (): Promise<DailyReport[]> => {
  try {
    const res = await axiosInstance.get(`reports/`);
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get All Reports Error:", error);
    throw error;
  }
};
