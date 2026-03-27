// src/pages/Admin/DeviceStatus.tsx
import { useState, useMemo } from "react";
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
    {alive ? "Alive" : "Stale"}
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
  const { data, isLoading, refetch, isFetching } = useGetAllDevicesStatus(true);

  const allDevices: DeviceDetail[] = useMemo(() => {
    if (!data) return [];
    return [...(data.alive ?? []), ...(data.stale ?? [])];
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allDevices;
    return allDevices.filter(
      (d) =>
        d.store_name?.toLowerCase().includes(q) ||
        d.username?.toLowerCase().includes(q),
    );
  }, [allDevices, search]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border shadow-sm px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Monitor size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {data.summary.total}
              </p>
              <p className="text-xs text-neutral-500">Total Devices</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-200 shadow-sm px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Wifi size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {data.summary.alive}
              </p>
              <p className="text-xs text-neutral-500">Alive</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 shadow-sm px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <WifiOff size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {data.summary.stale}
              </p>
              <p className="text-xs text-neutral-500">Stale</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div
        className="bg-white rounded-xl border border-border shadow-sm flex flex-col"
        style={{ height: data ? "calc(100vh - 260px)" : "calc(100vh - 80px)" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-neutral-800">
              All Devices
            </h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search store or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    STORE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    USERNAME
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    STATUS
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    CONNECTED
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    WEBSOCKET
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    HEARTBEAT
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    LAST SEEN
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((device, index) => (
                    <TableRow
                      key={device.store_id}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-neutral-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-800">
                        {device.store_name}
                      </TableCell>
                      <TableCell className="text-neutral-600 text-sm">
                        @{device.username}
                      </TableCell>
                      <TableCell>
                        <AliveBadge alive={device.is_alive} />
                      </TableCell>
                      <TableCell>
                        <YesNoBadge value={device.is_connected} />
                      </TableCell>
                      <TableCell>
                        <YesNoBadge value={device.websocket_connected} />
                      </TableCell>
                      <TableCell className="text-neutral-600 text-sm">
                        {formatSeconds(device.seconds_since_heartbeat)}
                      </TableCell>
                      <TableCell className="text-neutral-500 text-xs">
                        {formatHeartbeat(device.last_heartbeat)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-neutral-400"
                    >
                      No devices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((device) => (
              <div
                key={device.store_id}
                className={`rounded-xl border p-4 space-y-3 ${device.is_alive ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${device.is_alive ? "bg-green-100" : "bg-red-100"}`}
                    >
                      <Monitor
                        size={18}
                        className={
                          device.is_alive ? "text-green-600" : "text-red-500"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        {device.store_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        @{device.username}
                      </p>
                    </div>
                  </div>
                  <AliveBadge alive={device.is_alive} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div
                    className={`rounded-lg px-2 py-1.5 ${device.is_connected ? "bg-green-100" : "bg-neutral-100"}`}
                  >
                    <p className="text-xs font-bold">
                      {device.is_connected ? "✓" : "✗"}
                    </p>
                    <p className="text-xs text-neutral-500">Connected</p>
                  </div>
                  <div
                    className={`rounded-lg px-2 py-1.5 ${device.websocket_connected ? "bg-green-100" : "bg-neutral-100"}`}
                  >
                    <p className="text-xs font-bold">
                      {device.websocket_connected ? "✓" : "✗"}
                    </p>
                    <p className="text-xs text-neutral-500">WebSocket</p>
                  </div>
                  <div className="rounded-lg px-2 py-1.5 bg-neutral-100">
                    <p className="text-xs font-bold text-neutral-700">
                      {formatSeconds(device.seconds_since_heartbeat)}
                    </p>
                    <p className="text-xs text-neutral-500">Heartbeat</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No devices found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong> devices · Auto-refreshes
            every 30s
          </p>
        </div>
      </div>
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
