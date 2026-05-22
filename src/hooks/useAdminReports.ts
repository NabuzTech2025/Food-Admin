// src/hooks/useAdminReports.ts

import { useQuery } from "@tanstack/react-query";

import {
  getAdminTodayReports,
  type AdminTodayReportsResponse,
} from "@/api/reports";

const ADMIN_TODAY_REPORTS_KEY = "admin-today-reports";

export const useGetAdminTodayReports = () => {
  return useQuery<AdminTodayReportsResponse>({
    queryKey: [ADMIN_TODAY_REPORTS_KEY],

    queryFn: getAdminTodayReports,

    staleTime: 5 * 60 * 1000,
  });
};
