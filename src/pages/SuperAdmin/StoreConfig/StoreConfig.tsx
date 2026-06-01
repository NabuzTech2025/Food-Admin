import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, Edit, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetStoreConfigs } from "@/hooks/useStoreConfig";
import type { StoreConfig } from "@/api/storeConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LIMIT = 20;

function TableRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton height={16} />
        </TableCell>
      ))}
    </TableRow>
  );
}

function StoreConfigPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const {
    data: configs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetStoreConfigs({ limit: LIMIT, offset });

  const filtered = useMemo(
    () =>
      configs.filter(
        (c) =>
          c.app_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.country?.toLowerCase().includes(search.toLowerCase()) ||
          c.app_base_route?.toLowerCase().includes(search.toLowerCase()),
      ),
    [configs, search],
  );

  const handleEdit = (config: StoreConfig) => {
    navigate("/super/store-config/form", {
      state: { configData: config, mode: "edit" },
    });
  };

  const handleCreate = () => {
    navigate("/super/store-config/form", { state: { mode: "create" } });
  };

  const canGoPrev = offset > 0;
  const canGoNext = configs.length === LIMIT;

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Store Domain Config
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search configs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Config</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-16">Store ID</TableHead>
                <TableHead>App Name</TableHead>
                <TableHead>Base Route</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>PayPal Client ID</TableHead>
                <TableHead className="text-center">Distance Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-destructive text-sm"
                  >
                    Error:{" "}
                    {(error as any)?.message || "Failed to load store configs"}
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((config, idx) => (
                  <TableRow
                    key={`${config.store_id}-${idx}`}
                    className="hover:bg-primary/5"
                  >
                    <TableCell className="font-medium text-neutral-700">
                      {config.store_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {config.app_name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Globe size={13} className="text-neutral-400" />
                        {config.app_base_route || "—"}
                      </span>
                    </TableCell>
                    <TableCell>{config.country || "—"}</TableCell>
                    <TableCell className="text-xs text-neutral-500 max-w-[180px] truncate">
                      {config.paypal_live_client_id ? (
                        <span
                          title={config.paypal_live_client_id}
                          className="block truncate"
                        >
                          {config.paypal_live_client_id}
                        </span>
                      ) : (
                        <span className="text-neutral-300">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          config.use_distance_delivery
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {config.use_distance_delivery ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-neutral-400 text-sm"
                  >
                    No store configs found.{" "}
                    <button
                      onClick={handleCreate}
                      className="text-primary underline ml-1"
                    >
                      Add one
                    </button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with pagination */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Showing <strong>{filtered.length}</strong> config
            {filtered.length !== 1 ? "s" : ""}
            {search && ` (filtered from ${configs.length} total)`}
          </p>
          {!search && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                disabled={!canGoPrev || isFetching}
              >
                <ChevronLeft size={15} />
              </Button>
              <span className="text-xs text-neutral-500">
                Page {Math.floor(offset / LIMIT) + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((o) => o + LIMIT)}
                disabled={!canGoNext || isFetching}
              >
                <ChevronRight size={15} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoreConfigPage;
