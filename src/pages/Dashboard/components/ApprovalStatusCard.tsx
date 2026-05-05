import { Card, CardContent } from "@/components/ui/card";
import approvalAnim from "@/assets/lottie/approval.json";
import type { ApprovalStatuses } from "@/api/dashboard_report";
import { SectionHeader } from "./SectionHeader";
import { StatusRow } from "./StatusRow";

export function ApprovalStatusCard({
  approvalStatuses,
  totalOrders,
}: {
  approvalStatuses: ApprovalStatuses | undefined;
  totalOrders: number;
}) {
  return (
    <Card className="col-span-4 shadow-sm border-gray-200 rounded-xl overflow-hidden">
      <SectionHeader
        lottieSrc={approvalAnim}
        title="Approval status"
        right={
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {totalOrders} orders
          </span>
        }
      />
      <CardContent className="p-3 flex flex-col gap-2">
        <StatusRow label="Pending" value={approvalStatuses?.pending ?? 0} variant="pending" />
        <StatusRow label="Accepted" value={approvalStatuses?.accepted ?? 0} variant="accepted" />
        <StatusRow label="Declined" value={approvalStatuses?.declined ?? 0} variant="declined" />
      </CardContent>
    </Card>
  );
}
