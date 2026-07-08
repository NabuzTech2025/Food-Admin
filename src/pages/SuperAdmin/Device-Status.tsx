// src/pages/Admin/DeviceStatus.tsx
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Clock,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useGetAllDevicesStatus,
  useGetStoreDeviceStatus,
  useGetWindowsDeviceStatus,
} from "@/hooks/useDeviceStatus";
import type { DeviceDetail } from "@/api/deviceStatus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatHeartbeat = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString("de-DE");
  } catch {
    return dateStr;
  }
};

const formatSeconds = (sec: number) => {
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const AliveBadge = ({ alive }: { alive: boolean }) => (
  <Badge
    variant="outline"
    className={
      alive
        ? "border-green-200 text-green-700 bg-green-50"
        : "border-red-200 text-red-600 bg-red-50"
    }
  >
    {alive ? "Online" : "Offline"}
  </Badge>
);

const YesNoBadge = ({ value }: { value: boolean }) => (
  <Badge
    variant="outline"
    className={
      value
        ? "border-green-200 text-green-700 bg-green-50"
        : "border-neutral-200 text-neutral-500 bg-neutral-50"
    }
  >
    {value ? "Yes" : "No"}
  </Badge>
);

// ─── Super Admin View (role_id === 1) ────────────────────────────────────────

function SuperAdminView() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("windows");

  const {
    data: windowsData,
    isLoading: isWindowsLoading,
    refetch: refetchWindows,
    isFetching: isWindowsFetching,
  } = useGetWindowsDeviceStatus(activeTab === "windows");
  const {
    data: devicesData,
    isLoading: isDevicesLoading,
    refetch: refetchDevices,
    isFetching: isDevicesFetching,
  } = useGetAllDevicesStatus(activeTab === "devices");

  const isLoading =
    activeTab === "windows" ? isWindowsLoading : isDevicesLoading;
  const isFetching =
    activeTab === "windows" ? isWindowsFetching : isDevicesFetching;
  const refetch = activeTab === "windows" ? refetchWindows : refetchDevices;

  const filteredWindows = useMemo(() => {
    if (!windowsData) return [];
    const all = [...(windowsData.online ?? []), ...(windowsData.offline ?? [])];
    const q = search.toLowerCase();
    return q ? all.filter((d) => d.store_name?.toLowerCase().includes(q)) : all;
  }, [windowsData, search]);

  const filteredDevices = useMemo(() => {
    if (!devicesData) return [];
    const all = [...(devicesData.alive ?? []), ...(devicesData.stale ?? [])];
    const q = search.toLowerCase();
    return q
      ? all.filter(
          (d) =>
            d.store_name?.toLowerCase().includes(q) ||
            d.username?.toLowerCase().includes(q),
        )
      : all;
  }, [devicesData, search]);

  return (
    <div className="space-y-6 px-4 py-6 w-full">
      {/* Tabs at the very top */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="h-11 w-full sm:w-auto">
            <TabsTrigger
              value="windows"
              className="px-6 text-sm flex-1 sm:flex-none"
            >
              Windows
            </TabsTrigger>
            <TabsTrigger
              value="devices"
              className="px-6 text-sm flex-1 sm:flex-none"
            >
              Devices
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="windows" className="m-0 space-y-6">
          {/* Summary Cards */}
          {windowsData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-foreground">
                  {windowsData.summary.total}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  Total
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-500">
                  {windowsData.summary.online}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  Online
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-rose-600 dark:text-rose-500">
                  {windowsData.summary.offline}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  Offline
                </span>
              </div>
            </div>
          )}

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <h2 className="text-xl font-semibold text-foreground">
              All Windows Stores
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search store name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-56 bg-background"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                className="bg-background shrink-0"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </div>

          {/* List of Cards */}
          <div className="space-y-3 pb-10">
            {isWindowsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filteredWindows.length > 0 ? (
              filteredWindows.map((device) => (
                <div
                  key={device.store_id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${device.online ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                    />
                    <div>
                      <h3 className="font-medium text-foreground text-base">
                        {device.store_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ID: {device.store_id}
                      </p>
                      {device.since && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>
                            {formatDistanceToNow(new Date(device.since))} ago
                          </span>
                          <span>
                            {new Date(device.since).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {device.online ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                      >
                        Online
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground border-border"
                      >
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
                No stores found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="m-0 space-y-6">
          {/* Summary Cards */}
          {devicesData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-foreground">
                  {devicesData.summary.total}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  Total
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-500">
                  {devicesData.summary.alive}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  Alive
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-rose-600 dark:text-rose-500">
                  {devicesData.summary.stale}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  Stale
                </span>
              </div>
            </div>
          )}

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <h2 className="text-xl font-semibold text-foreground">
              All Devices
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search store or user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-56 bg-background"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                className="bg-background shrink-0"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </div>

          {/* List of Cards */}
          <div className="space-y-3 pb-10">
            {isDevicesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <div
                  key={device.store_id}
                  className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-md transition-all gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${device.is_alive ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                    <div>
                      <h3 className="font-medium text-foreground text-base">
                        {device.store_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ID: {device.store_id} &bull; @{device.username}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Wifi
                            size={12}
                            className={
                              device.is_connected
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }
                          />
                          {device.is_connected ? "Connected" : "Disconnected"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Monitor
                            size={12}
                            className={
                              device.websocket_connected
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }
                          />
                          {device.websocket_connected
                            ? "WS Connected"
                            : "WS Disconnected"}
                        </span>
                      </div>
                      {device.last_heartbeat && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>
                            {formatSeconds(device.seconds_since_heartbeat)}
                          </span>
                          <span>
                            (
                            {new Date(device.last_heartbeat).toLocaleString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                            )
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="self-end sm:self-center">
                    {device.is_alive ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                      >
                        Alive
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
                      >
                        Stale
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
                No devices found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Store Admin View (role_id === 2) ────────────────────────────────────────

function StoreAdminView() {
  const { store_id } = useAdminStore();
  const {
    data: device,
    isLoading,
    refetch,
    isFetching,
  } = useGetStoreDeviceStatus(store_id, true);

  const alive = device?.is_alive;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-neutral-800">
              Device Status
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : device ? (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`rounded-xl p-5 flex items-center gap-4 ${alive ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${alive ? "bg-green-100" : "bg-red-100"}`}
                >
                  {alive ? (
                    <Wifi size={28} className="text-green-600" />
                  ) : (
                    <WifiOff size={28} className="text-red-500" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xl font-bold ${alive ? "text-green-700" : "text-red-600"}`}
                  >
                    {alive ? "Device Online" : "Device Offline"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {device.store_name}
                  </p>
                </div>
                <AliveBadge alive={alive!} />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                  <Store size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Store</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      {device.store_name}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                  <Monitor size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Username</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      @{device.username}
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${device.is_connected ? "border-green-200 bg-green-50/50" : "border-neutral-200 bg-muted/20"}`}
                >
                  <Wifi
                    size={18}
                    className={
                      device.is_connected
                        ? "text-green-600 flex-shrink-0"
                        : "text-neutral-400 flex-shrink-0"
                    }
                  />
                  <div>
                    <p className="text-xs text-neutral-500">Connected</p>
                    <p
                      className={`text-sm font-semibold ${device.is_connected ? "text-green-700" : "text-neutral-500"}`}
                    >
                      {device.is_connected ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${device.websocket_connected ? "border-green-200 bg-green-50/50" : "border-neutral-200 bg-muted/20"}`}
                >
                  <Wifi
                    size={18}
                    className={
                      device.websocket_connected
                        ? "text-green-600 flex-shrink-0"
                        : "text-neutral-400 flex-shrink-0"
                    }
                  />
                  <div>
                    <p className="text-xs text-neutral-500">WebSocket</p>
                    <p
                      className={`text-sm font-semibold ${device.websocket_connected ? "text-green-700" : "text-neutral-500"}`}
                    >
                      {device.websocket_connected
                        ? "Connected"
                        : "Disconnected"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                  <Clock size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Last Heartbeat</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      {formatSeconds(device.seconds_since_heartbeat)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                  <Clock size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Last Seen</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      {formatHeartbeat(device.last_heartbeat)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400">
              <Monitor size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No device data found.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t bg-muted/30 rounded-b-xl">
          <p className="text-xs text-neutral-500">
            Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function DeviceStatusPage() {
  const { role_id } = useAdminStore();
  return role_id === 1 ? <SuperAdminView /> : <StoreAdminView />;
}

export default DeviceStatusPage;
