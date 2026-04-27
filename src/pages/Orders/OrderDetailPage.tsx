import { useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  ShoppingBag,
  FileText,
  CreditCard,
  MapPin,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/api/order";

const ORDER_STATUS_MAP: Record<number, { label: string; className: string }> = {
  1: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  3: { label: "Preparing", className: "bg-orange-100 text-orange-700" },
  4: { label: "Ready", className: "bg-purple-100 text-purple-700" },
  5: { label: "Delivered", className: "bg-green-100 text-green-700" },
  6: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const APPROVAL_STATUS_MAP: Record<
  number,
  { label: string; className: string }
> = {
  1: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "Approved", className: "bg-green-100 text-green-700" },
  3: { label: "Rejected", className: "bg-red-100 text-red-700" },
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

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Icon size={15} className="text-neutral-500" />
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-neutral-400 flex-shrink-0">{label}</span>
      <span className="text-xs text-neutral-700 text-right">{value}</span>
    </div>
  );
}

function OrderDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    return (
      <div className="text-center py-20 text-neutral-400 text-sm">
        Order not found.{" "}
        <button
          onClick={() => navigate(-1)}
          className="text-primary underline ml-1"
        >
          Go back
        </button>
      </div>
    );
  }

  const customerName =
    order.shipping_address?.customer_name ||
    order.guest_shipping_json?.customer_name ||
    order.user?.username ||
    "Guest";

  const orderStatus = ORDER_STATUS_MAP[order.order_status] ?? {
    label: "Unknown",
    className: "bg-gray-100 text-gray-500",
  };

  const approvalStatus = APPROVAL_STATUS_MAP[order.approval_status] ?? {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft size={15} />
            Back
          </Button>
          <div>
            <h2 className="text-base font-semibold text-neutral-800">
              Order #{order.order_number}
            </h2>
            <p className="text-xs text-neutral-400">
              {format(new Date(order.created_at), "dd MMM yyyy, HH:mm")} ·{" "}
              {order.source}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${orderStatus.className}`}>
            {orderStatus.label}
          </Badge>
          <Badge className={`text-xs ${approvalStatus.className}`}>
            {approvalStatus.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Items */}
        <SectionCard title="Order Items" icon={ShoppingBag}>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-3 space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-neutral-800">
                    {item.product_name}
                  </span>
                  <span className="text-sm font-semibold text-neutral-800">
                    €{(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>
                    €{item.unit_price.toFixed(2)} × {item.quantity}
                  </span>
                  <span>Tax: {item.tax}%</span>
                </div>
                {item.variant_name && (
                  <p className="text-xs text-neutral-500">
                    Variant: {item.variant_name}
                  </p>
                )}
                {item.toppings.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.toppings.map((t) => (
                      <span
                        key={t.topping_id}
                        className="text-xs bg-muted border border-border rounded-full px-2 py-0.5 text-neutral-500"
                      >
                        {t.name}{" "}
                        {t.price > 0 ? (
                          <span className="text-neutral-700">
                            +€{t.price.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-green-600">free</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {item.note && (
                  <p className="text-xs text-neutral-400 italic">
                    "{item.note}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Invoice */}
        <SectionCard title="Invoice & Payment" icon={FileText}>
          {order.invoice ? (
            <div className="space-y-0">
              <InfoRow
                label="Invoice No."
                value={
                  <span className="font-mono text-[10px] break-all">
                    {order.invoice.invoice_number}
                  </span>
                }
              />
              <InfoRow
                label="Delivery Fee"
                value={`€${order.invoice.delivery_fee.toFixed(2)}`}
              />
              <InfoRow
                label="Discount"
                value={
                  <span className="text-red-500">
                    -€{order.invoice.discount_amount.toFixed(2)}
                  </span>
                }
              />
              {order.tax_summary.map((t, i) => (
                <InfoRow
                  key={i}
                  label={`Tax (${t.tax_rate}%)`}
                  value={`€${t.tax_amount.toFixed(2)}`}
                />
              ))}
              {order.brutto_netto_summary.map((b, i) => (
                <>
                  <InfoRow
                    key={`netto-${i}`}
                    label="Netto"
                    value={`€${b.netto.toFixed(2)}`}
                  />
                  <InfoRow
                    key={`brutto-${i}`}
                    label="Brutto"
                    value={`€${b.brutto.toFixed(2)}`}
                  />
                </>
              ))}
              <div className="pt-2 mt-2 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-neutral-700">
                  Total
                </span>
                <span className="text-base font-bold text-neutral-900">
                  €{order.invoice.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400">No invoice available.</p>
          )}

          {/* Payment */}
          {order.payment && (
            <div className="mt-4 pt-4 border-t border-border space-y-0">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={13} className="text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                  Payment
                </span>
              </div>
              <InfoRow label="Method" value={order.payment.payment_method} />
              <InfoRow
                label="Status"
                value={
                  paymentStatus ? (
                    <Badge className={`text-xs ${paymentStatus.className}`}>
                      {paymentStatus.label}
                    </Badge>
                  ) : (
                    "-"
                  )
                }
              />
              <InfoRow
                label="Paid At"
                value={format(new Date(order.payment.paid_at), "dd MMM, HH:mm")}
              />
              <InfoRow
                label="Amount"
                value={`€${order.payment.amount.toFixed(2)}`}
              />
            </div>
          )}
        </SectionCard>

        {/* Customer & Address */}
        <SectionCard title="Customer & Delivery" icon={MapPin}>
          <div className="space-y-0">
            <InfoRow label="Name" value={customerName} />
            {order.user && (
              <InfoRow label="Email" value={order.user.username} />
            )}
            {(order.shipping_address?.phone ||
              order.guest_shipping_json?.phone) && (
              <InfoRow
                label="Phone"
                value={
                  order.shipping_address?.phone ||
                  order.guest_shipping_json?.phone
                }
              />
            )}
            {(order.shipping_address?.line1 ||
              order.guest_shipping_json?.line1) && (
              <InfoRow
                label="Address"
                value={[
                  order.shipping_address?.line1 ||
                    order.guest_shipping_json?.line1,
                  order.shipping_address?.city ||
                    order.guest_shipping_json?.city,
                  order.shipping_address?.zip || order.guest_shipping_json?.zip,
                  order.shipping_address?.country ||
                    order.guest_shipping_json?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            )}
            {order.guest_shipping_json?.email && (
              <InfoRow label="Email" value={order.guest_shipping_json.email} />
            )}
            <InfoRow
              label="Order Type"
              value={ORDER_TYPE_MAP[order.order_type] ?? "-"}
            />
            <InfoRow
              label="Delivery Time"
              value={
                order.delivery_time
                  ? format(new Date(order.delivery_time), "dd MMM yyyy, HH:mm")
                  : "-"
              }
            />
            {order.note && <InfoRow label="Note" value={order.note} />}
          </div>
        </SectionCard>

        {/* Discount */}
        {order.discount && (
          <SectionCard title="Discount" icon={Tag}>
            <div className="space-y-0">
              <InfoRow
                label="Code"
                value={
                  <span className="font-mono font-medium">
                    {order.discount.code}
                  </span>
                }
              />
              <InfoRow label="Type" value={order.discount.type} />
              <InfoRow
                label="Value"
                value={
                  order.discount.type === "percentage"
                    ? `${order.discount.value}%`
                    : `€${order.discount.value}`
                }
              />
              <InfoRow
                label="Expires"
                value={format(
                  new Date(order.discount.expires_at),
                  "dd MMM yyyy",
                )}
              />
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default OrderDetailPage;
