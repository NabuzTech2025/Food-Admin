import { useGetStores } from "@/hooks/useStoreDetails";
import { useGetAdminTodayReports } from "@/hooks/useAdminReports";

import { Store, MapPin, Activity, ShieldCheck, Loader2 } from "lucide-react";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../../../components/SuperAdmin/DashBoard/StatCard";
import AllStoresPanel from "../../../components/SuperAdmin/DashBoard/AllStoresPanel";

function SuperAdminDashboard() {
  const { data: stores = [], isLoading, isError } = useGetStores();

  const {
    data: reportsData,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useGetAdminTodayReports();

  const navigate = useNavigate();

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

    return {
      totalStores,
      activeStores,
      closedStores,
      uniqueCountries,
    };
  }, [stores]);

  // ================= STORE PANEL DATA =================

  const allStoresPanelData = useMemo(() => {
    if (!reportsData?.reports) return [];

    return (
      reportsData.reports
        .map((reportItem) => ({
          id: reportItem.store_id,

          name: reportItem.store_name,

          order: reportItem.report?.total_orders ?? 0,

          sales: reportItem.report?.total_sales ?? 0,

          status:
            stores.find((store) => store.id === reportItem.store_id)
              ?.manual_status ?? "close",
        }))

        // OPEN STORES FIRST
        .sort((a, b) => {
          if (a.status === "open" && b.status !== "open") return -1;

          if (a.status !== "open" && b.status === "open") return 1;

          return 0;
        })
    );
  }, [reportsData, stores]);

  // ================= LOADING =================

  if (isLoading || isLoadingReports) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

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
      </div>

      {/* Stores Panel */}
      <AllStoresPanel
        stores={allStoresPanelData}
        onViewAll={() => navigate("/super/store-details")}
      />
    </div>
  );
}

export default SuperAdminDashboard;
