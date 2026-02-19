export type LoginFormData = {
  identifier: string;
  password: string;
};

export interface AdminStorageData {
  token: string;
  role_id: number;
  store_id?: number;
  store_type?: string;
}

export interface UserAnalyticsData {
  period: string;
  educator: number;
  individual: number;
  total: number;
}

export interface AnalyticsResponse {
  status: number;
  message: string;
  data: {
    monthlyData?: UserAnalyticsData[];
    yearlyData?: UserAnalyticsData[];
    summary?: {
      totalUsers: number;
      totalEducators: number;
      totalIndividuals: number;
      currentMonthGrowth: number;
      currentYearGrowth: number;
    };
  };
}

interface CaseCountData {
  id: number;
  title: string;
  categories: string[];
  tabs: string[];
}

export interface CaseCountSummary {
  unit: number;
  specialty: number;
  all: number;
}

export interface CaseCountResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    cases: CaseCountData[];
    summary: CaseCountSummary;
    totalCases: number;
  };
  timestamp: string;
}
