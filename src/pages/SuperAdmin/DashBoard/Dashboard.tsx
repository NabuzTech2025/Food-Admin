import { useGetStores } from "@/hooks/useStoreDetails";
import {
  Store,
  MapPin,
  Activity,
  ShieldCheck,
  Loader2,
  Calendar,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

    const countries = new Set(stores.map((s) => s.country).filter(Boolean));
    const uniqueCountries = countries.size;

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Total Stores</p>
            <h3 className="text-2xl font-bold text-neutral-800">
              {stats.totalStores}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Active Stores
            </p>
            <h3 className="text-2xl font-bold text-neutral-800">
              {stats.activeStores}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Closed Stores
            </p>
            <h3 className="text-2xl font-bold text-neutral-800">
              {stats.closedStores}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Countries Served
            </p>
            <h3 className="text-2xl font-bold text-neutral-800">
              {stats.uniqueCountries}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added Stores */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-neutral-800">
              Recently Added Stores
            </h3>
            <button
              onClick={() => navigate("/super/store-details")}
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-border">
            {stats.recentStores.map((store) => (
              <div
                key={store.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {store.logo || store.image_url ? (
                      <img
                        src={(store.logo || store.image_url)!.split("?")[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store size={18} className="text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-neutral-800">
                      {store.name || "Unnamed"}
                    </h4>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {store.address || "No Address"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      store.manual_status === "open"
                        ? "bg-green-100 text-green-700"
                        : store.manual_status === "close"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {store.manual_status || "UNKNOWN"}
                  </span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {store.created_at
                      ? new Date(store.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
            {stats.recentStores.length === 0 && (
              <div className="p-8 text-center text-sm text-neutral-500">
                No stores found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/super/store-details")}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-primary-light hover:border-primary/30 transition-colors text-sm font-medium text-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <Store size={18} className="text-primary" />
                  Manage Stores
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
