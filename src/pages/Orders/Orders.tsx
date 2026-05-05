import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Search,
  Loader2,
  CalendarIcon,
  ShoppingBag,
  Clock,
  User,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useGetOrders } from "@/hooks/useOrder";
import type { Order } from "@/api/order";

// ─── Maps ─────────────────────────────────────────────────────────
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

// ─── Order Detail Modal ───────────────────────────────────────────
function OrderDetailModal({
  order,
  open,
  onClose,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!order) return null;

  const customerName =
    order.shipping_address?.customer_name ||
    order.guest_shipping_json?.customer_name ||
    order.user?.username ||
    "Guest";

  const phone =
    order.shipping_address?.phone || order.guest_shipping_json?.phone || "-";

  const email = order.guest_shipping_json?.email || order.user?.username || "-";

  const approvalStatus =
    order.approval_status === 2
      ? { label: "Accepted", className: "border-green-500 text-green-600" }
      : order.approval_status === 3
        ? { label: "Rejected", className: "border-red-500 text-red-600" }
        : { label: "Pending", className: "border-yellow-500 text-yellow-600" };

  const items = order.items ?? [];
  const vatSummary = order.brutto_netto_summary ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg md:max-w-xl mx-4 sm:mx-auto rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-neutral-800">
            Order Details
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Header */}
        <div className="text-center space-y-0.5 border-b border-dashed border-border pb-3">
          <p className="text-lg font-bold text-neutral-800">
            Order Number # {order.order_number}
          </p>
          {order.invoice && (
            <p className="text-base text-neutral-500 break-all">
              Invoice number: {order.invoice.invoice_number}
            </p>
          )}
          <p className="text-base text-neutral-500">
            Date: {format(new Date(order.created_at), "dd-MM-yyyy HH:mm")}
          </p>
          {order.delivery_time && (
            <p className="text-base text-neutral-500">
              Delivery Time:{" "}
              {format(new Date(order.delivery_time), "dd-MM-yyyy HH:mm")}
            </p>
          )}
        </div>

        {/* Customer Info */}
        <div className="border-b border-dashed border-border pb-3 space-y-0.5">
          <p className="text-base text-neutral-600">
            <span className="font-medium">Customer:</span> {customerName}
          </p>
          <p className="text-base text-neutral-600">
            <span className="font-medium">Phone:</span> {phone}
          </p>
          <p className="text-base text-neutral-600">
            <span className="font-medium">Email:</span> {email}
          </p>
        </div>

        {/* Items */}
        <div className="border-b border-dashed border-border pb-3 space-y-2">
          {items.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between items-start">
                <span className="text-base font-semibold text-neutral-800">
                  {item.quantity}X {item.product_name} [
                  {item.unit_price.toFixed(2)}]
                </span>
                <span className="text-base font-semibold text-neutral-800">
                  £ {(item.unit_price * item.quantity).toFixed(2)}
                </span>
              </div>
              {(item.toppings?.length ?? 0) > 0 && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {item.toppings!.map((t) => (
                    <p key={t.topping_id} className="text-base text-neutral-400">
                      {item.quantity} × {t.name} [{t.price.toFixed(2)}]
                    </p>
                  ))}
                </div>
              )}
              {item.note && (
                <p className="text-base text-neutral-400 italic ml-3">
                  Note: {item.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-b border-dashed border-border pb-3 space-y-1">
          {/* Subtotal */}
          <div className="flex justify-between text-base text-neutral-600">
            <span>Subtotal</span>
            <span>
              {items
                .reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
                .toFixed(2)}
            </span>
          </div>

          {/* Discount */}
          {order.invoice?.discount_amount !== undefined &&
            order.invoice.discount_amount > 0 && (
              <div className="flex justify-between text-base text-neutral-600">
                <span>Discount</span>
                <span className="text-red-500">
                  -{order.invoice.discount_amount.toFixed(2)}
                </span>
              </div>
            )}

          {/* Grand Total */}
          <div className="flex justify-between text-lg font-bold text-neutral-800 pt-1">
            <span>Grand Total</span>
            <span>£ {order.invoice?.total_amount?.toFixed(2) ?? "-"}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-b border-dashed border-border pb-3 space-y-0.5">
          {order.invoice && (
            <p className="text-base text-neutral-500 break-all">
              Invoice number: {order.invoice.invoice_number}
            </p>
          )}
          <p className="text-base text-neutral-600">
            Payment method: {order.payment?.payment_method ?? "-"}
          </p>
          {order.payment?.paid_at && (
            <p className="text-base text-neutral-600">
              Paid:{" "}
              {format(new Date(order.payment.paid_at), "dd-MM-yyyy HH:mm")}
            </p>
          )}
          <p className="text-base text-neutral-600">
            Coupon Applied: {order.discount?.code ?? "null"}
          </p>
        </div>

        {/* VAT Table */}
        {vatSummary.length > 0 && (
          <div className="pb-3">
            <div className="grid grid-cols-4 text-base font-semibold text-neutral-600 mb-1">
              <span>VAT Rate</span>
              <span className="text-center">Gross</span>
              <span className="text-center">Net</span>
              <span className="text-right">VAT</span>
            </div>
            {vatSummary.map((b, i) => (
              <div
                key={i}
                className="grid grid-cols-4 text-base text-neutral-500"
              >
                <span>{b.tax_rate} %</span>
                <span className="text-center">{b.brutto.toFixed(2)}</span>
                <span className="text-center">{b.netto.toFixed(2)}</span>
                <span className="text-right">{b.tax_amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status Button */}
        <div className="flex justify-center pt-1">
          <button
            className={`border-2 rounded-full px-8 py-2 text-sm font-semibold ${approvalStatus.className}`}
          >
            Status: {approvalStatus.label}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order Card ───────────────────────────────────────────────────
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
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
      onClick={onClick}
      className="bg-white border border-border rounded-xl p-5 min-h-[168px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-neutral-800">
          #{order.order_number}
        </span>
        <Badge className={`text-sm ${orderStatus.className}`}>
          {orderStatus.label}
        </Badge>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 text-base text-neutral-600">
        <User size={16} className="text-neutral-400" />
        <span className="truncate">{customerName}</span>
      </div>

      {/* Items summary */}
      <div className="flex items-start gap-2 text-sm text-neutral-500">
        <ShoppingBag
          size={16}
          className="text-neutral-400 mt-0.5 flex-shrink-0"
        />
        <span className="line-clamp-2">
          {order.items
            .map((i) => `${i.product_name} ×${i.quantity}`)
            .join(", ")}
        </span>
      </div>

      {/* Delivery time */}
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Clock size={15} />
        <span>
          {order.delivery_time
            ? format(new Date(order.delivery_time), "dd MMM, HH:mm")
            : "-"}
        </span>
      </div>

      <div className="border-t border-border" />

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-neutral-400">
            {ORDER_TYPE_MAP[order.order_type] ?? "-"}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-sm text-neutral-400">{order.source}</span>
          {paymentStatus && (
            <>
              <span className="text-neutral-300">·</span>
              <Badge className={`text-sm ${paymentStatus.className}`}>
                {paymentStatus.label}
              </Badge>
            </>
          )}
        </div>
        <span className="text-base font-bold text-neutral-800">
          €{order.invoice?.total_amount?.toFixed(2) ?? "-"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function OrderPage() {
  const { store_id } = useAdminStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = searchParams.get("date");
    if (d) {
      const [y, m, day] = d.split("-").map(Number);
      const parsed = new Date(y, m - 1, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => {
                    setSelectedOrder(order);
                    setModalOpen(true);
                  }}
                />
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}

export default OrderPage;
