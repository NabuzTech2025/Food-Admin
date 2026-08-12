import { CreditCard } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";
import { Card, CardContent } from "@/components/ui/card";
import paymentAnim from "@/assets/lottie/payment.json";
import emptyAnim from "@/assets/lottie/empty.json";
import type { PaymentMethods } from "@/api/dashboard_report";
import { SectionHeader } from "./SectionHeader";
import { MetricCell } from "./MetricCell";

export function PaymentMethodsCard({
  paymentMethods,
  fmt,
}: {
  paymentMethods: PaymentMethods | undefined;
  fmt: (val?: number) => string;
}) {
  const methods = paymentMethods ?? {};
  return (
    <Card className="col-span-4 shadow-sm border-gray-200 rounded-xl overflow-hidden">
      <SectionHeader lottieSrc={paymentAnim} title="Payment methods" />
      <CardContent className="p-0">
        {Object.keys(methods).length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[100px] gap-1.5 text-gray-300 text-xs">
            <Player autoplay loop src={emptyAnim as never} style={{ width: 52, height: 52 }} />
            No payment data for today
          </div>
        ) : (
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            {Object.entries(methods).map(([method, amount]) => (
              <MetricCell
                key={method}
                icon={CreditCard}
                label={method.charAt(0).toUpperCase() + method.slice(1)}
                value={typeof amount === "number" ? fmt(amount) : String(amount)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
