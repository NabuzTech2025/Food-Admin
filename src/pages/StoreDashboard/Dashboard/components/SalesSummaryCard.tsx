import { TrendingUp, PackageOpen, Tag, Truck, Banknote, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import salesAnim from "@/assets/lottie/sales.json";
import type { DashboardReport } from "@/api/dashboard_report";
import { SectionHeader } from "./SectionHeader";
import { MetricCell } from "./MetricCell";

export function SalesSummaryCard({
  report,
  fmt,
}: {
  report: DashboardReport | undefined;
  fmt: (val?: number) => string;
}) {
  return (
    <Card className="shadow-sm border-gray-200 rounded-xl overflow-hidden">
      <SectionHeader lottieSrc={salesAnim} title="Sales summary" />
      <CardContent className="p-0">
        <div className="grid grid-cols-4 divide-x divide-y divide-gray-100">
          <MetricCell icon={TrendingUp} label="Total sales" value={fmt(report?.total_sales)} />
          <MetricCell icon={PackageOpen} label="Net total" value={fmt(report?.net_total)} />
          <MetricCell icon={Tag} label="Total tax" value={fmt(report?.total_tax)} />
          <MetricCell icon={Truck} label="Sales + delivery" value={fmt(report?.["total_sales + delivery"])} />
          <MetricCell icon={Banknote} label="Cash total" value={fmt(report?.cash_total)} />
          <MetricCell icon={Globe} label="Online total" value={fmt(report?.online_total)} />
          <MetricCell icon={Tag} label="Discount total" value={fmt(report?.discount_total)} />
          <MetricCell icon={Truck} label="Delivery fee" value={fmt(report?.delivery_total)} />
        </div>
      </CardContent>
    </Card>
  );
}
