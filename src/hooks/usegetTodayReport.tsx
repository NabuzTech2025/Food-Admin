import { getDashboardReport } from "@/api/dashboard_report";
import { useQuery } from "@tanstack/react-query";

export const DASHBOARD_REPORT_KEY = "dashboard_report";
export const useGetDashboardReport = () =>
  useQuery({
    queryKey: [DASHBOARD_REPORT_KEY],
    queryFn: () => getDashboardReport(),
    enabled: true,
  });
