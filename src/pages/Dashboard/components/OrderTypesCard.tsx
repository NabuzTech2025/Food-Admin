import { Truck, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import deliveryAnim from "@/assets/lottie/delivery.json";
import type { OrderTypes } from "@/api/dashboard_report";
import { SectionHeader } from "./SectionHeader";
import { OrderTypeCard } from "./OrderTypeCard";

export function OrderTypesCard({ orderTypes }: { orderTypes: OrderTypes | undefined }) {
  return (
    <Card className="col-span-4 shadow-sm border-gray-200 rounded-xl overflow-hidden">
      <SectionHeader lottieSrc={deliveryAnim} title="Order types" iconSize={36} />
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2">
          <OrderTypeCard icon={Truck} label="Delivery" value={orderTypes?.delivery ?? 0} />
          <OrderTypeCard icon={ShoppingBag} label="Pickup" value={orderTypes?.pickup ?? 0} />
          <OrderTypeCard icon={UtensilsCrossed} label="Dine-in" value={orderTypes?.dine_in ?? 0} />
        </div>
      </CardContent>
    </Card>
  );
}
