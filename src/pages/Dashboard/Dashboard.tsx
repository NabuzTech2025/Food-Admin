import { Player } from "@lottiefiles/react-lottie-player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from "lucide-react";
import { useGetDashboardReport } from "@/hooks/usegetTodayReport";
import loadingAnim from "@/assets/lottie/loading.json";

import { SalesSummaryCard } from "./components/SalesSummaryCard";
import { OrderTypesCard } from "./components/OrderTypesCard";
import { ApprovalStatusCard } from "./components/ApprovalStatusCard";
import { PaymentMethodsCard } from "./components/PaymentMethodsCard";
import { SalesCalendar } from "./components/SalesCalendar";

export default function Dashboard() {
  const { data: report, isLoading } = useGetDashboardReport();
  const fmt = (val?: number) => `€${(val ?? 0).toFixed(2)}`;

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
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <span className="text-xs text-gray-400">
            Today's performance overview
          </span>
        </div>

        <Dialog>
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
            <SalesCalendar />
          </DialogContent>
        </Dialog>
      </div>

      <SalesSummaryCard report={report} fmt={fmt} />

      <div className="grid grid-cols-12 gap-3">
        <OrderTypesCard orderTypes={report?.order_types} />
        <ApprovalStatusCard
          approvalStatuses={report?.approval_statuses}
          totalOrders={report?.total_orders ?? 0}
        />
        <PaymentMethodsCard
          paymentMethods={report?.payment_methods}
          fmt={fmt}
        />
      </div>
    </div>
  );
}
