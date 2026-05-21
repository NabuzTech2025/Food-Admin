import { useGetStores } from "@/hooks/useStoreDetails";
import { Store, MapPin, Activity, ShieldCheck, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../../components/SuperAdmin/DashBoard/StatCard";
import RecentStoresPanel from "../../../components/SuperAdmin/DashBoard/RecentStoresPanel";
import QuickActionsPanel from "../../../components/SuperAdmin/DashBoard/QuickActionsPanel";

function SuperAdminDashboard() {
  const { data: stores = [], isLoading, isError } = useGetStores();
  const navigate = useNavigate();

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
    const recentStores = [...stores]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      )
      .slice(0, 5);

    return {
      totalStores,
      activeStores,
      closedStores,
      uniqueCountries,
      recentStores,
    };
  }, [stores]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of all restaurant stores and activities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentStoresPanel
          stores={stats.recentStores}
          onViewAll={() => navigate("/super/store-details")}
        />
        <div className="space-y-6">
          <QuickActionsPanel
            onManageStores={() => navigate("/super/store-details")}
          />
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
