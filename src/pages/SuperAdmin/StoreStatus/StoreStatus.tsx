import { useMemo, useState } from "react";
import { Loader2, Search, Store, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAllStoresActive, useSetStoreActive } from "@/hooks/useStore";

type FilterTab = "all" | "visible" | "hidden";

function StoreStatusPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

  const isActiveFilter =
    tab === "all" ? undefined : tab === "visible" ? true : false;

  const { data, isLoading } = useGetAllStoresActive(isActiveFilter);
  const { mutateAsync: setStoreActive, isPending: isToggling } =
    useSetStoreActive();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const stores = useMemo(() => {
    const list = data ?? [];
    const q = search.toLowerCase().trim();
    return q ? list.filter((s) => s.name?.toLowerCase().includes(q)) : list;
  }, [data, search]);

  const handleToggle = async (id: number, isActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await setStoreActive({ id, isActive });
      toast.success(res.message);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update store visibility",
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 w-full">
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">Store Status</h2>
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
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        Controls visibility in the Magskr customer app (nearby + search). The
        store's own ordering website is unaffected.
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="h-11">
          <TabsTrigger value="all" className="px-6">
            All
          </TabsTrigger>
          <TabsTrigger value="visible" className="px-6">
            Visible
          </TabsTrigger>
          <TabsTrigger value="hidden" className="px-6">
            Hidden
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3 pb-10">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <div
              key={store.id}
              className="bg-card rounded-xl border border-border p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Store size={20} className="text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-base truncate">
                    {store.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    ID: {store.id}
                  </p>
                  {store.address && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant="outline"
                  className={
                    store.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-muted text-muted-foreground border-border"
                  }
                >
                  {store.is_active ? "Visible" : "Hidden"}
                </Badge>
                <Switch
                  checked={store.is_active}
                  disabled={isToggling && togglingId === store.id}
                  onCheckedChange={(checked) => handleToggle(store.id, checked)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            No stores found.
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreStatusPage;
