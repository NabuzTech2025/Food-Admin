// src/pages/CustomerDetail.tsx
import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  UserCheck,
  Users,
  Loader2,
  Clock,
  Hash,
  ChevronRight,
  X,
  Package,
  CreditCard,
  MapPin,
  Utensils,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useInfiniteCustomers } from "@/hooks/useCustomer";
import type { Customer, CustomerOrder } from "@/api/customer";
import { getOrderDetail } from "@/api/customer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const formatDateShort = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ─── Order Detail Helpers ─────────────────────────────────────────────────────

const ORDER_TYPE_MAP: Record<number, string> = {
  1: "Delivery",
  2: "Pickup",
  3: "Dine-in",
};

const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Pending", color: "border-yellow-200 text-yellow-700 bg-yellow-50" },
  2: { label: "Confirmed", color: "border-blue-200 text-blue-700 bg-blue-50" },
  3: { label: "Preparing", color: "border-orange-200 text-orange-700 bg-orange-50" },
  4: { label: "Ready", color: "border-cyan-200 text-cyan-700 bg-cyan-50" },
  5: { label: "Delivered", color: "border-green-200 text-green-700 bg-green-50" },
  6: { label: "Cancelled", color: "border-red-200 text-red-700 bg-red-50" },
};

const APPROVAL_STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Pending", color: "border-yellow-200 text-yellow-700 bg-yellow-50" },
  2: { label: "Approved", color: "border-green-200 text-green-700 bg-green-50" },
  3: { label: "Rejected", color: "border-red-200 text-red-700 bg-red-50" },
};

// ─── Order Detail Modal ───────────────────────────────────────────────────────

interface OrderDetailModalProps {
  order: CustomerOrder | null;
  orderDetail: any | null;
  isLoading: boolean;
  onClose: () => void;
}

const OrderDetailModal = ({
  order,
  orderDetail,
  isLoading,
  onClose,
}: OrderDetailModalProps) => {
  if (!order) return null;

  const d = orderDetail;
  const orderStatus = d ? ORDER_STATUS_MAP[d.order_status] : null;
  const approvalStatus = d ? APPROVAL_STATUS_MAP[d.approval_status] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-orange-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800">Order Details</h3>
              <p className="text-xs text-neutral-500">
                #{d?.order_number || order.order_number}
                {d?.source && <span className="ml-2 text-neutral-400">• {d.source}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} className="text-neutral-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm text-neutral-500">Loading order details...</p>
            </div>
          ) : d ? (
            <div className="space-y-5">

              {/* ── Status & Type Row ── */}
              <div className="flex flex-wrap gap-2">
                {orderStatus && (
                  <Badge variant="outline" className={orderStatus.color}>
                    {orderStatus.label}
                  </Badge>
                )}
                {approvalStatus && (
                  <Badge variant="outline" className={approvalStatus.color}>
                    {approvalStatus.label}
                  </Badge>
                )}
                {d.order_type && (
                  <Badge variant="outline" className="border-neutral-200 text-neutral-600 bg-neutral-50">
                    {ORDER_TYPE_MAP[d.order_type] || `Type ${d.order_type}`}
                  </Badge>
                )}
                {d.payment?.status && (
                  <Badge variant="outline" className={
                    d.payment.status === "paid"
                      ? "border-green-200 text-green-700 bg-green-50"
                      : "border-yellow-200 text-yellow-700 bg-yellow-50"
                  }>
                    {d.payment.status}
                  </Badge>
                )}
              </div>

              {/* ── Order Info Grid ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <Hash size={11} />
                    Order #
                  </div>
                  <p className="font-bold text-neutral-800">{d.order_number}</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <Calendar size={11} />
                    Created
                  </div>
                  <p className="font-semibold text-neutral-800 text-sm">
                    {formatDate(d.created_at)}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                    <Clock size={11} />
                    Delivery Time
                  </div>
                  <p className="font-semibold text-neutral-800 text-sm">
                    {formatDate(d.delivery_time)}
                  </p>
                </div>
              </div>

              {/* ── Items ── */}
              {d.items && d.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                    <Utensils size={14} />
                    Items ({d.items.length})
                  </h4>
                  <div className="space-y-2">
                    {d.items.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="bg-neutral-50 rounded-lg p-3 border border-neutral-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {item.quantity}x
                            </span>
                            <div>
                              <p className="text-sm font-medium text-neutral-800">
                                {item.product_name}
                              </p>
                              {item.variant_name && (
                                <p className="text-xs text-neutral-500">{item.variant_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-neutral-700">
                              €{Number(item.unit_price).toFixed(2)}
                            </p>
                            <p className="text-xs text-neutral-400">Tax: {item.tax}%</p>
                          </div>
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mt-2 pl-10 flex flex-wrap gap-1">
                            {item.toppings.map((t: any, ti: number) => (
                              <span key={ti} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                                + {t.name || t.topping_name}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.note && (
                          <p className="mt-1 pl-10 text-xs text-neutral-500 italic">Note: {item.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Invoice / Payment Summary ── */}
              {d.invoice && (
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl p-4 border border-neutral-200">
                  <h4 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                    <CreditCard size={14} />
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span>€{(Number(d.invoice.total_amount) - Number(d.invoice.delivery_fee) + Number(d.invoice.discount_amount)).toFixed(2)}</span>
                    </div>
                    {d.invoice.delivery_fee > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Delivery Fee</span>
                        <span>€{Number(d.invoice.delivery_fee).toFixed(2)}</span>
                      </div>
                    )}
                    {d.invoice.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount {d.discount?.code && `(${d.discount.code})`}</span>
                        <span>-€{Number(d.invoice.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-800 text-base">
                      <span>Total</span>
                      <span>€{Number(d.invoice.total_amount).toFixed(2)}</span>
                    </div>
                    {d.payment && (
                      <div className="flex justify-between text-xs text-neutral-500 pt-1">
                        <span>
                          Paid via <span className="capitalize font-medium">{d.payment.payment_method}</span>
                        </span>
                        <span>{formatDate(d.payment.paid_at)}</span>
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 pt-1">
                      Invoice: {d.invoice.invoice_number}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Shipping Address ── */}
              {d.shipping_address && (
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
                    <MapPin size={12} />
                    Shipping Address
                  </h4>
                  <p className="text-sm font-medium text-neutral-800">
                    {d.shipping_address.customer_name}
                  </p>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    {d.shipping_address.line1}
                    {d.shipping_address.city && `, ${d.shipping_address.city}`}
                    {d.shipping_address.zip && ` ${d.shipping_address.zip}`}
                  </p>
                  <p className="text-sm text-neutral-600">{d.shipping_address.country}</p>
                  {d.shipping_address.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
                      <Phone size={11} />
                      {d.shipping_address.phone}
                    </div>
                  )}
                </div>
              )}

              {/* ── Tax Summary ── */}
              {d.tax_summary && d.tax_summary.length > 0 && (
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <h4 className="text-xs font-semibold text-neutral-600 mb-2">Tax Summary</h4>
                  <div className="space-y-1">
                    {d.tax_summary.map((t: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-neutral-700">
                        <span>Tax {t.tax_rate}%</span>
                        <span>€{Number(t.tax_amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Discount Info ── */}
              {d.discount && (
                <div className="bg-green-50/50 rounded-xl p-3 border border-green-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">{d.discount.code}</p>
                      <p className="text-xs text-green-600">
                        {d.discount.type === "percentage" ? `${d.discount.value}% off` : `€${d.discount.value} off`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-green-500">
                    Expires: {formatDateShort(d.discount.expires_at)}
                  </p>
                </div>
              )}

            </div>
          ) : (
            /* Fallback: API error */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                    <Hash size={12} />
                    Order Number
                  </div>
                  <p className="font-bold text-neutral-800">
                    #{order.order_number}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                    <Calendar size={12} />
                    Order Date
                  </div>
                  <p className="font-semibold text-neutral-800 text-sm">
                    {formatDate(order.order_date)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
                <Package size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Failed to load order details.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-border bg-neutral-50">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { store_id } = useAdminStore();

  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // ── Fetch all customers and find the one we need ──
  const { data, isLoading } = useInfiniteCustomers({
    store_id: store_id ?? "",
    limit: 100,
  });

  const customers = useMemo(() => {
    return data?.pages.flatMap((page) => page.customers) ?? [];
  }, [data]);

  const customer = useMemo(() => {
    return customers.find((c) => String(c.id) === id) ?? null;
  }, [customers, id]);

  // ── Orders from customer data with local pagination ──
  const ORDERS_PER_PAGE = 10;
  const [visibleCount, setVisibleCount] = useState(ORDERS_PER_PAGE);

  const allOrders = customer?.orders ?? [];
  const visibleOrders = allOrders.slice(0, visibleCount);
  const hasMoreOrders = visibleCount < allOrders.length;

  const handleOrderScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (
        target.scrollHeight - target.scrollTop <=
        target.clientHeight + 100
      ) {
        if (hasMoreOrders) {
          setVisibleCount((prev) => Math.min(prev + ORDERS_PER_PAGE, allOrders.length));
        }
      }
    },
    [hasMoreOrders, allOrders.length],
  );

  // ── Handle order click ──
  const handleOrderClick = async (order: CustomerOrder) => {
    setSelectedOrder(order);
    setOrderDetail(null);
    setOrderDetailLoading(true);
    try {
      const detail = await getOrderDetail(order.order_id);
      setOrderDetail(detail);
    } catch (err) {
      console.error("Failed to fetch order detail:", err);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-sm text-neutral-500">Loading customer details...</p>
      </div>
    );
  }

  // ── Customer not found ──
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Users size={48} className="text-neutral-300" />
        <p className="text-lg font-semibold text-neutral-600">
          Customer not found
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/customer")}
          className="cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const isRegistered = customer.customer_type === "registered";

  return (
    <div className="space-y-4">
      {/* ── Back Button ── */}
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/customer")}
        className="text-neutral-600 hover:text-primary cursor-pointer -ml-2"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Customers
      </Button>

      {/* ── Customer Detail Card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Top Gradient Bar */}
        <div
          className={`h-1.5 ${
            isRegistered
              ? "bg-gradient-to-r from-primary to-orange-400"
              : "bg-gradient-to-r from-neutral-300 to-neutral-400"
          }`}
        />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0 ${
                isRegistered
                  ? "bg-primary text-white"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {customer.customer_name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-neutral-800">
                  {customer.customer_name || "Unknown Customer"}
                </h1>
                <Badge
                  variant="outline"
                  className={
                    isRegistered
                      ? "border-primary/30 text-primary bg-primary/10"
                      : "border-neutral-200 text-neutral-600 bg-neutral-100/50"
                  }
                >
                  {isRegistered ? (
                    <UserCheck size={12} className="mr-1" />
                  ) : (
                    <Users size={12} className="mr-1" />
                  )}
                  {customer.customer_type}
                </Badge>
                {customer.user_id && (
                  <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                    UID: {customer.user_id}
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Phone size={15} className="text-neutral-400" />
                  {customer.phone || "No phone"}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <Mail size={15} className="text-neutral-400" />
                    {customer.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {customer.total_orders}
              </p>
              <p className="text-xs text-orange-500 flex items-center justify-center gap-1 mt-1">
                <ShoppingBag size={11} />
                Total Orders
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-blue-700 truncate">
                {formatDateShort(customer.first_order_date)}
              </p>
              <p className="text-xs text-blue-500 flex items-center justify-center gap-1 mt-1">
                <Calendar size={11} />
                First Order
              </p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-green-700 truncate">
                {formatDateShort(customer.last_order_date)}
              </p>
              <p className="text-xs text-green-500 flex items-center justify-center gap-1 mt-1">
                <Calendar size={11} />
                Last Order
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-purple-700 truncate">
                {formatDateShort(customer.created_at)}
              </p>
              <p className="text-xs text-purple-500 flex items-center justify-center gap-1 mt-1">
                <Clock size={11} />
                Created
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Orders Section ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-340px)] sm:h-[calc(100vh-300px)]">
        {/* Orders Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="text-base font-bold text-neutral-800">
              Orders
            </h2>
            <span className="text-sm text-neutral-500">
              ({allOrders.length})
            </span>
          </div>
        </div>

        {/* Orders List - Scrollable */}
        <div
          className="flex-1 overflow-y-auto"
          onScroll={handleOrderScroll}
        >
          {allOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
              <ShoppingBag size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium text-neutral-500">
                No orders found
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                This customer hasn't placed any orders yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleOrders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => handleOrderClick(order)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-primary/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Order Number Badge */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Hash size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        Order #{order.order_number}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <Calendar size={11} />
                        {formatDate(order.order_date)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-neutral-400 group-hover:text-primary transition-colors"
                  />
                </div>
              ))}

              {/* Loading more indicator */}
              {hasMoreOrders && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    Scroll for more orders...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Orders Footer */}
        <div className="flex-shrink-0 flex items-center px-5 py-3 border-t border-border bg-neutral-50/50 rounded-b-xl">
          <p className="text-sm text-neutral-500">
            Showing{" "}
            <strong className="text-neutral-800">
              {Math.min(visibleCount, allOrders.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-neutral-800">{allOrders.length}</strong>{" "}
            orders
          </p>
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      <OrderDetailModal
        order={selectedOrder}
        orderDetail={orderDetail}
        isLoading={orderDetailLoading}
        onClose={() => {
          setSelectedOrder(null);
          setOrderDetail(null);
        }}
      />
    </div>
  );
}
