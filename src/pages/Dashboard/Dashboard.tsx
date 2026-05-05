import { Player } from "@lottiefiles/react-lottie-player";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Banknote,
  Globe,
  Tag,
  PackageOpen,
  CreditCard,
} from "lucide-react";
import { useGetDashboardReport } from "@/hooks/usegetTodayReport";

import salesAnim from "@/assets/lottie/sales.json";
import deliveryAnim from "@/assets/lottie/delivery.json";
import approvalAnim from "@/assets/lottie/approval.json";
import paymentAnim from "@/assets/lottie/payment.json";
import loadingAnim from "@/assets/lottie/loading.json";
import emptyAnim from "@/assets/lottie/empty.json";

// ─── Metric Cell ────────────────────────────────────────────────────────────
function MetricCell({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-gray-400" strokeWidth={1.5} />}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ─── Order Type Card ─────────────────────────────────────────────────────────
function OrderTypeCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  const active = value > 0;
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-all ${
        active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${active ? "bg-green-100" : "bg-gray-100"}`}
      >
        <Icon
          className={`w-5 h-5 ${active ? "text-green-600" : "text-gray-400"}`}
          strokeWidth={1.5}
        />
      </div>
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-2xl font-bold ${active ? "text-green-600" : "text-gray-800"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Status Row ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
  accepted: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-100",
    badge: "bg-green-100 text-green-700",
  },
  declined: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-50",
    border: "border-red-100",
    badge: "bg-red-100 text-red-700",
  },
};

function StatusRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "pending" | "accepted" | "declined";
}) {
  const cfg = STATUS_CONFIG[variant];
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} strokeWidth={1.5} />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <span
        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.badge}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Section Header (Lottie only here) ───────────────────────────────────────
function SectionHeader({
  lottieSrc,
  title,
  right,
}: {
  lottieSrc: object;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/70">
      <div className="flex items-center gap-2">
        <Player
          autoplay
          loop
          src={lottieSrc as never}
          style={{ width: 24, height: 24 }}
        />
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
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
      {/* Title */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-xs text-gray-400">
          Today's performance overview
        </span>
      </div>

      {/* Sales Summary */}
      <Card className="shadow-sm border-gray-200 rounded-xl overflow-hidden">
        <SectionHeader lottieSrc={salesAnim} title="Sales summary" />
        <CardContent className="p-0">
          <div className="grid grid-cols-4 divide-x divide-y divide-gray-100">
            <MetricCell
              icon={TrendingUp}
              label="Total sales"
              value={fmt(report?.total_sales)}
            />
            <MetricCell
              icon={PackageOpen}
              label="Net total"
              value={fmt(report?.net_total)}
            />
            <MetricCell
              icon={Tag}
              label="Total tax"
              value={fmt(report?.total_tax)}
            />
            <MetricCell
              icon={Truck}
              label="Sales + delivery"
              value={fmt(report?.["total_sales + delivery"])}
            />
            <MetricCell
              icon={Banknote}
              label="Cash total"
              value={fmt(report?.cash_total)}
            />
            <MetricCell
              icon={Globe}
              label="Online total"
              value={fmt(report?.online_total)}
            />
            <MetricCell
              icon={Tag}
              label="Discount total"
              value={fmt(report?.discount_total)}
            />
            <MetricCell
              icon={Truck}
              label="Delivery fee"
              value={fmt(report?.delivery_total)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom 3-col row */}
      <div className="grid grid-cols-12 gap-3">
        {/* Order Types */}
        <Card className="col-span-4 shadow-sm border-gray-200 rounded-xl overflow-hidden">
          <SectionHeader lottieSrc={deliveryAnim} title="Order types" />
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2">
              <OrderTypeCard
                icon={Truck}
                label="Delivery"
                value={report?.order_types?.delivery ?? 0}
              />
              <OrderTypeCard
                icon={ShoppingBag}
                label="Pickup"
                value={report?.order_types?.pickup ?? 0}
              />
              <OrderTypeCard
                icon={UtensilsCrossed}
                label="Dine-in"
                value={report?.order_types?.dine_in ?? 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Approval Status */}
        <Card className="col-span-4 shadow-sm border-gray-200 rounded-xl overflow-hidden">
          <SectionHeader
            lottieSrc={approvalAnim}
            title="Approval status"
            right={
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {report?.total_orders ?? 0} orders
              </span>
            }
          />
          <CardContent className="p-3 flex flex-col gap-2">
            <StatusRow
              label="Pending"
              value={report?.approval_statuses?.pending ?? 0}
              variant="pending"
            />
            <StatusRow
              label="Accepted"
              value={report?.approval_statuses?.accepted ?? 0}
              variant="accepted"
            />
            <StatusRow
              label="Declined"
              value={report?.approval_statuses?.declined ?? 0}
              variant="declined"
            />
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="col-span-4 shadow-sm border-gray-200 rounded-xl overflow-hidden">
          <SectionHeader lottieSrc={paymentAnim} title="Payment methods" />
          <CardContent className="p-0">
            {Object.keys(report?.payment_methods ?? {}).length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[100px] gap-1.5 text-gray-300 text-xs">
                <Player
                  autoplay
                  loop
                  src={emptyAnim as never}
                  style={{ width: 52, height: 52 }}
                />
                No payment data for today
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                {Object.entries(report!.payment_methods).map(
                  ([method, amount]) => (
                    <MetricCell
                      key={method}
                      icon={CreditCard}
                      label={method.charAt(0).toUpperCase() + method.slice(1)}
                      value={
                        typeof amount === "number"
                          ? fmt(amount)
                          : String(amount)
                      }
                    />
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
