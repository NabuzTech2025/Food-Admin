import { useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, X, CalendarDays } from "lucide-react";
import { useGetDashboardReport } from "@/hooks/usegetTodayReport";
import type { DailyReport, DashboardReport } from "@/api/dashboard_report";
import loadingAnim from "@/assets/lottie/loading.json";

import { SalesSummaryCard } from "./components/SalesSummaryCard";
import { OrderTypesCard } from "./components/OrderTypesCard";
import { ApprovalStatusCard } from "./components/ApprovalStatusCard";
import { PaymentMethodsCard } from "./components/PaymentMethodsCard";
import { SalesCalendar } from "./components/SalesCalendar";

export default function Dashboard() {
  const { data: todayReport, isLoading } = useGetDashboardReport();
  const [selectedDay, setSelectedDay] = useState<DailyReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fmt = (val?: number) => `€${(val ?? 0).toFixed(2)}`;

  // Use selected day's nested data when available, fall back to today's report
  const activeReport: DashboardReport | undefined = selectedDay
    ? (selectedDay.data as DashboardReport)
    : todayReport;

  const selectedDateKey = selectedDay?.start_date.slice(0, 10);

  const handleDaySelect = (report: DailyReport) => {
    setSelectedDay(report);
    setDialogOpen(false);
  };

  // Format selected date for display
  const selectedDateLabel = selectedDateKey
    ? (() => {
        const [y, m, d] = selectedDateKey.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("default", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      })()
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <Player
          autoplay
          loop
          src={loadingAnim as never}
          style={{ width: 72, height: 72 }}
        />
        <span className="text-sm text-gray-400">Loading report...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            {!selectedDateLabel && (
              <span className="text-xs text-gray-400">
                Today's performance overview
              </span>
            )}
          </div>

          {/* Selected day badge */}
          {selectedDateLabel && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
              <CalendarDays className="w-3 h-3 text-green-600" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-green-700">
                {selectedDateLabel}
              </span>
              <button
                onClick={() => setSelectedDay(null)}
                className="ml-0.5 rounded hover:bg-green-200 transition-colors"
                aria-label="Back to today"
              >
                <X className="w-3 h-3 text-green-600" />
              </button>
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <History className="w-3.5 h-3.5" strokeWidth={1.5} />
              History
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg p-4">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                Sales History
              </DialogTitle>
            </DialogHeader>
            <SalesCalendar
              onDaySelect={handleDaySelect}
              selectedDateKey={selectedDateKey}
            />
          </DialogContent>
        </Dialog>
      </div>

      <SalesSummaryCard report={activeReport} fmt={fmt} />

      <div className="grid grid-cols-12 gap-3">
        <OrderTypesCard orderTypes={activeReport?.order_types} />
        <ApprovalStatusCard
          approvalStatuses={activeReport?.approval_statuses}
          totalOrders={activeReport?.total_orders ?? 0}
        />
        <PaymentMethodsCard
          paymentMethods={activeReport?.payment_methods}
          fmt={fmt}
        />
      </div>
    </div>
  );
}
