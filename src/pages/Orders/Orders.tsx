import { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Loader2,
  CalendarIcon,
  ShoppingBag,
  Clock,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useGetOrders } from "@/hooks/useOrder";
import type { Order } from "@/api/order";

const ORDER_STATUS_MAP: Record<number, { label: string; className: string }> = {
  1: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  3: { label: "Preparing", className: "bg-orange-100 text-orange-700" },
  4: { label: "Ready", className: "bg-purple-100 text-purple-700" },
  5: { label: "Delivered", className: "bg-green-100 text-green-700" },
  6: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; className: string }> =
  {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    paid: { label: "Paid", className: "bg-green-100 text-green-700" },
    failed: { label: "Failed", className: "bg-red-100 text-red-700" },
    refunded: { label: "Refunded", className: "bg-gray-100 text-gray-600" },
  };

const ORDER_TYPE_MAP: Record<number, string> = {
  1: "Dine In",
  2: "Takeaway",
  3: "Delivery",
};

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();

  const customerName =
    order.shipping_address?.customer_name ||
    order.guest_shipping_json?.customer_name ||
    order.user?.username ||
    "Guest";

  const orderStatus = ORDER_STATUS_MAP[order.order_status] ?? {
    label: "Unknown",
    className: "bg-gray-100 text-gray-500",
  };

  const paymentStatus = order.payment?.status
    ? (PAYMENT_STATUS_MAP[order.payment.status] ?? {
        label: order.payment.status,
        className: "bg-gray-100 text-gray-500",
      })
    : null;

  return (
    <div
      onClick={() =>
        navigate(`/admin/orders/${order.id}`, { state: { order } })
      }
      className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-800">
          #{order.order_number}
        </span>
        <Badge className={`text-xs ${orderStatus.className}`}>
          {orderStatus.label}
        </Badge>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <User size={14} className="text-neutral-400" />
        <span className="truncate">{customerName}</span>
      </div>

      {/* Items summary */}
      <div className="flex items-start gap-2 text-xs text-neutral-500">
        <ShoppingBag
          size={14}
          className="text-neutral-400 mt-0.5 flex-shrink-0"
        />
        <span className="line-clamp-2">
          {order.items
            .map((i) => `${i.product_name} ×${i.quantity}`)
            .join(", ")}
        </span>
      </div>

      {/* Delivery time */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <Clock size={13} />
        <span>
          {order.delivery_time
            ? format(new Date(order.delivery_time), "dd MMM, HH:mm")
            : "-"}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-neutral-400">
            {ORDER_TYPE_MAP[order.order_type] ?? "-"}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-xs text-neutral-400">{order.source}</span>
          {paymentStatus && (
            <>
              <span className="text-neutral-300">·</span>
              <Badge className={`text-xs ${paymentStatus.className}`}>
                {paymentStatus.label}
              </Badge>
            </>
          )}
        </div>
        <span className="text-sm font-bold text-neutral-800">
          €{order.invoice?.total_amount?.toFixed(2) ?? "-"}
        </span>
      </div>
    </div>
  );
}

function OrderPage() {
  const { store_id } = useAdminStore();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: orders = [], isLoading } = useGetOrders({
    store_id: store_id!,
    target_date: format(selectedDate, "yyyy-MM-dd"),
    offset: 0,
  });

  const filtered = orders.filter((o) => {
    const customer =
      o.shipping_address?.customer_name ||
      o.guest_shipping_json?.customer_name ||
      o.user?.username ||
      "";
    const q = search.toLowerCase();
    return (
      customer.toLowerCase().includes(q) ||
      String(o.order_number).includes(q) ||
      o.source.toLowerCase().includes(q) ||
      o.payment?.payment_method?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">Orders</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>

            {/* Date Picker */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-sm"
                >
                  <CalendarIcon size={15} className="text-neutral-400" />
                  {format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-400 text-sm">
              No orders found for {format(selectedDate, "dd MMM yyyy")}.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${orders.length} total)`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
