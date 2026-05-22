import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Store } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetStores } from "@/hooks/useStoreDetails";
import type { Store as StoreType } from "@/api/storedetails";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function StoreCardSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex flex-col items-center text-center p-5">
        <Skeleton circle width={80} height={80} className="mb-3" />
        <Skeleton width={120} height={16} className="mb-1" />
        <Skeleton width={80} height={12} className="mb-3" />
        <div className="flex gap-1.5 justify-center">
          <Skeleton width={90} height={20} borderRadius={999} />
          <Skeleton width={70} height={20} borderRadius={999} />
        </div>
      </div>
      <div className="bg-muted/40 text-center py-2 border-t border-border">
        <Skeleton width={96} height={12} inline />
      </div>
    </div>
  );
}

function AllStorePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: stores = [], isLoading, isError, error } = useGetStores(13);

  const filtered = stores.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCardClick = (store: StoreType) => {
    navigate("/store-profile", {
      state: { storeData: store, mode: "edit" },
    });
  };

  const handleCreateNew = () => {
    navigate("/store-profile", { state: { mode: "create" } });
  };

  return (
    <SkeletonTheme baseColor="#f0f0f0" highlightColor="#e0e0e0">
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
                  onChange={(e) => setSearch(e.target.value)}
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
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <StoreCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-destructive text-sm">
                Error: {(error as any)?.message || "Failed to load stores"}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleCardClick(store)}
                    className="group border border-border rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-200 bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col items-center text-center p-5">
                      {/* Logo */}
                      <div className="w-20 h-20 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center mb-3">
                        {store.logo || store.image_url ? (
                          <img
                            src={(store.logo || store.image_url)!.split("?")[0]}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store size={32} className="text-neutral-400" />
                        )}
                      </div>

                      <h5 className="font-semibold text-neutral-800 mb-1">
                        {store.name || "Unnamed Store"}
                      </h5>
                      <p className="text-xs text-neutral-500 mb-3">
                        {store.description || "Store"}
                      </p>

                      <div className="flex flex-wrap justify-center gap-1.5">
                        {store.address && (
                          <span className="text-xs bg-muted text-neutral-600 border border-border rounded-full px-2.5 py-0.5">
                            📍 {store.address}
                          </span>
                        )}
                        {store.country && (
                          <span className="text-xs bg-muted text-neutral-600 border border-border rounded-full px-2.5 py-0.5">
                            🌍 {store.country}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted/40 text-center py-2 border-t border-border">
                      <span className="text-xs text-neutral-500 group-hover:text-primary transition-colors">
                        Click to Manage
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-400 text-sm">
                No stores found.{" "}
                <button
                  onClick={handleCreateNew}
                  className="text-primary underline ml-1"
                >
                  Add a store
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t bg-muted/30">
            <p className="text-xs text-neutral-500">
              Total: <strong>{filtered.length}</strong>
              {search && ` (filtered from ${stores.length} total)`}
            </p>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}

export default AllStorePage;
