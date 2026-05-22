// src/api/reports.ts

import axiosInstance from "@/api/axiosConfig";

// ================= TYPES =================

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

export interface StoreReport {
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

export interface AdminTodayReportItem {
  store_id: number;
  store_name: string;
  has_data: boolean;
  report: Partial<StoreReport>;
}

export interface AdminTodayReportsResponse {
  generated_at: string;
  total_stores: number;
  reports: AdminTodayReportItem[];
}

// ================= API =================

export const getAdminTodayReports =
  async (): Promise<AdminTodayReportsResponse> => {
    try {
      const res = await axiosInstance.get("reports/admin/today");

      return res.data;
    } catch (error) {
      console.error("Get Admin Today Reports Error:", error);

      throw error;
    }
  };
