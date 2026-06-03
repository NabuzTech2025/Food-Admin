import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  Edit,
  Store,
  MapPin,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetStores } from "@/hooks/useStoreDetails";
import type { Store as StoreType } from "@/api/storedetails";
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
      {Array.from({ length: 5 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton height={16} />
        </TableCell>
      ))}
    </TableRow>
  );
}

function AllStorePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const {
    data: stores = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetStores(13);

  const filtered = useMemo(
    () =>
      stores.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.description?.toLowerCase().includes(search.toLowerCase()) ||
          s.address?.toLowerCase().includes(search.toLowerCase()),
      ),
    [stores, search],
  );

  const paginated = useMemo(
    () => (search ? filtered : filtered.slice(offset, offset + LIMIT)),
    [filtered, offset, search],
  );

  const handleEdit = (store: StoreType) => {
    navigate(`/super/stores/${store.id}/store-profile`);
  };

  const handleCreateNew = () => {
    navigate("/store-profile", { state: { mode: "create" } });
  };

  const canGoPrev = offset > 0;
  const canGoNext = !search && filtered.length > offset + LIMIT;

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            All Stores
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search stores..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOffset(0);
                }}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Store</span>
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
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Country</TableHead>
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
                    colSpan={6}
                    className="text-center py-10 text-destructive text-sm"
                  >
                    Error: {(error as any)?.message || "Failed to load stores"}
                  </TableCell>
                </TableRow>
              ) : paginated.length > 0 ? (
                paginated.map((store) => (
                  <TableRow key={store.id} className="hover:bg-primary/5">
                    {/* Logo */}
                    <TableCell>
                      <div className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center overflow-hidden shadow-sm">
                        {store.logo || store.image_url ? (
                          <img
                            src={(store.logo || store.image_url)!.split("?")[0]}
                            alt={store.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Store size={18} className="text-neutral-400" />
                        )}
                      </div>
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-medium text-neutral-800">
                      {store.name || "Unnamed Store"}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-sm text-neutral-500 max-w-[200px] truncate">
                      {store.description || (
                        <span className="text-neutral-300">—</span>
                      )}
                    </TableCell>

                    {/* Address */}
                    <TableCell className="text-sm text-neutral-500">
                      {store.address ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} className="text-neutral-400" />
                          {store.address}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </TableCell>

                    {/* Country */}
                    <TableCell>
                      {store.country ? (
                        <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                          <Globe size={13} className="text-neutral-400" />
                          {store.country}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(store)}
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
                    colSpan={6}
                    className="text-center py-10 text-neutral-400 text-sm"
                  >
                    No stores found.{" "}
                    <button
                      onClick={handleCreateNew}
                      className="text-primary underline ml-1"
                    >
                      Add a store
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
            Showing <strong>{paginated.length}</strong> store
            {paginated.length !== 1 ? "s" : ""}
            {search && ` (filtered from ${stores.length} total)`}
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

export default AllStorePage;
