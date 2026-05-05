// hook — add to usegetTodayReport.ts
import { getAllReports } from "@/api/dashboard_report";
import { useQuery } from "@tanstack/react-query";

export const REPORTS_KEY = "reports";

export const useGetAllReports = () =>
  useQuery({
    queryKey: [REPORTS_KEY],
    queryFn: () => getAllReports(),
  });
