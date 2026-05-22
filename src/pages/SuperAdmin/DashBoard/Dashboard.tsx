import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Activity,
  ShieldCheck,
  CalendarIcon,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useGetStores } from "@/hooks/useStoreDetails";
import { useGetAdminTodayReports } from "@/hooks/useAdminReports";
import { useGetAdminOrders } from "@/hooks/useAdminOrders";
import type { Order } from "@/api/order";

import StatCard from "../../../components/SuperAdmin/DashBoard/StatCard";
import AllStoresPanel from "../../../components/SuperAdmin/DashBoard/AllStoresPanel";
import { OrderCard, OrderDetailModal } from "@/pages/Orders/Orders";

// ─── Skeleton shapes matching each real component ────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
      <Skeleton circle width={48} height={48} />
      <div className="flex-1">
        <Skeleton width={96} height={12} />
        <Skeleton width={64} height={24} className="mt-1" />
      </div>
    </div>
  );
}

function StoresPanelSkeleton() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 px-6 py-4">
        <Skeleton width={160} height={20} />
        <Skeleton width={220} height={12} className="mt-1" />
      </div>
      <div className="flex gap-5 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[320px] rounded-3xl border border-neutral-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Skeleton width={56} height={56} borderRadius={16} />
                <div>
                  <Skeleton width={128} height={16} />
                  <Skeleton width={80} height={12} className="mt-1" />
                </div>
              </div>
              <Skeleton width={64} height={24} borderRadius={999} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Skeleton height={96} borderRadius={16} />
              <Skeleton height={96} borderRadius={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 min-h-[168px] space-y-4">
      <Skeleton width={112} height={24} borderRadius={999} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton circle width={32} height={32} />
          <Skeleton width={144} height={16} />
        </div>
        <Skeleton width={80} height={24} borderRadius={999} />
      </div>
      <div className="flex justify-between">
        <Skeleton width={96} height={12} />
        <Skeleton width={64} height={12} />
        <Skeleton width={80} height={12} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function SuperAdminDashboard() {
  const { data: stores = [], isLoading, isError } = useGetStores();
  const {
    data: reportsData,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useGetAdminTodayReports();

  const navigate = useNavigate();

  // ================= DATE STATE =================

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startCalOpen, setStartCalOpen] = useState(false);
  const [endCalOpen, setEndCalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ================= ORDERS =================

  const today = format(new Date(), "yyyy-MM-dd");
  const formattedStart = format(startDate, "yyyy-MM-dd");
  const formattedEnd = format(endDate, "yyyy-MM-dd");
  const isCustomRange = formattedStart !== today || formattedEnd !== today;

  const { data: orders = [], isLoading: isLoadingOrders } = useGetAdminOrders({
    start_date: formattedStart,
    end_date: formattedEnd,
    include_past: isCustomRange,
  });

  // ================= STATS =================

  const stats = useMemo(() => {
    const totalStores = stores.length;
    const activeStores = stores.filter(
      (s) => s.manual_status === "open",
    ).length;
    const closedStores = stores.filter(
      (s) => s.manual_status === "close",
    ).length;
    const uniqueCountries = new Set(
      stores.map((s) => s.country).filter(Boolean),
    ).size;
    return { totalStores, activeStores, closedStores, uniqueCountries };
  }, [stores]);

  // ================= STORE PANEL DATA =================

  const allStoresPanelData = useMemo(() => {
    if (!reportsData?.reports) return [];

    return reportsData.reports
      .map((reportItem) => ({
        id: reportItem.store_id,
        name: reportItem.store_name,
        order: reportItem.report?.total_orders ?? 0,
        sales: reportItem.report?.total_sales ?? 0,
        status:
          stores.find((store) => store.id === reportItem.store_id)
            ?.manual_status ?? "close",
      }))
      .sort((a, b) => {
        if (a.status === "open" && b.status !== "open") return -1;
        if (a.status !== "open" && b.status === "open") return 1;
        return 0;
      });
  }, [reportsData, stores]);

  // ================= ERROR =================

  if (isError || isErrorReports) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  // ================= UI =================

  return (
    <SkeletonTheme baseColor="#f0f0f0" highlightColor="#e0e0e0">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Super Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Overview of all restaurant stores and activities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            <>
              <StatCard
                icon={Store}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                label="Total Stores"
                value={stats.totalStores}
              />
              <StatCard
                icon={ShieldCheck}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                label="Active Stores"
                value={stats.activeStores}
              />
              <StatCard
                icon={Activity}
                iconBg="bg-red-100"
                iconColor="text-red-600"
                label="Closed Stores"
                value={stats.closedStores}
              />
              <StatCard
                icon={MapPin}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                label="Countries Served"
                value={stats.uniqueCountries}
              />
            </>
          )}
        </div>

        {/* Stores Panel */}
        {isLoadingReports ? (
          <StoresPanelSkeleton />
        ) : (
          <AllStoresPanel
            stores={allStoresPanelData}
            onViewAll={() => navigate("/super/store-details")}
          />
        )}

        {/* Orders Section */}
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {/* Header with date pickers */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Orders</h2>
              <p className="text-sm text-neutral-500">
                All store orders for the selected date range.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Start Date */}
              <Popover open={startCalOpen} onOpenChange={setStartCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-sm"
                  >
                    <CalendarIcon size={15} className="text-neutral-400" />
                    <span className="text-neutral-500 text-xs mr-1">From:</span>
                    {format(startDate, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setStartCalOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover open={endCalOpen} onOpenChange={setEndCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-sm"
                  >
                    <CalendarIcon size={15} className="text-neutral-400" />
                    <span className="text-neutral-500 text-xs mr-1">To:</span>
                    {format(endDate, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setEndCalOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Order Cards */}
          <div className="p-6">
            {isLoadingOrders ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <OrderCardSkeleton key={i} />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    storeName={order.store_name}
                    onClick={() => {
                      setSelectedOrder(order);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-400 text-sm">
                No orders found for {format(startDate, "dd MMM yyyy")} –{" "}
                {format(endDate, "dd MMM yyyy")}.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-2 border-t bg-muted/30">
            <p className="text-xs text-neutral-500">
              Total: <strong>{orders.length}</strong> orders
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
    </SkeletonTheme>
  );
}

export default SuperAdminDashboard;
