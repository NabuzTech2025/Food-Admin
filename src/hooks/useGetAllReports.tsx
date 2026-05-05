// hook — add to usegetTodayReport.ts
import { getAllReports } from "@/api/dashboard_report";
import { useQuery } from "@tanstack/react-query";

export const REPORTS_KEY = "reports";

export const useGetAllReports = () => {
  const adminDataStr = sessionStorage.getItem("AdminData");
  if (!adminDataStr) {
    throw new Error("No admin data found in session storage");
  }
  const adminData: { token?: string; store_id?: number } =
    JSON.parse(adminDataStr);
  return useQuery({
    queryKey: [REPORTS_KEY, adminData.store_id],
    queryFn: () => getAllReports(),
  });
};
