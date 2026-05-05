import { getDashboardReport } from "@/api/dashboard_report";
import { useQuery } from "@tanstack/react-query";

export const DASHBOARD_REPORT_KEY = "dashboard_report";

export const useGetDashboardReport = () => {
  const adminDataStr = sessionStorage.getItem("AdminData");
  const adminData: { token?: string; store_id?: number } = adminDataStr
    ? JSON.parse(adminDataStr)
    : {};

  return useQuery({
    queryKey: [DASHBOARD_REPORT_KEY, adminData.store_id],
    queryFn: () => getDashboardReport(),
  });
};
