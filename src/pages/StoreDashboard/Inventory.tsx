// src/pages/Admin/Inventory.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, SlidersHorizontal, Plus } from "lucide-react";
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
import { useGetInventory } from "@/hooks/useInventory";
import { useGetProduct } from "@/hooks/useProduct";
import AdjustStockForm from "@/components/Forms/AdjustStockForm";
import AddInventoryForm from "@/components/Forms/AddInventoryForm";
import type { InventoryItem } from "@/api/inventory";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayData(
  item: InventoryItem,
  products: any[],
): { name: string; id: number | undefined; isVariant: boolean } {
  const hasVariant = !!item.variant_id && !item.product_id;
  const hasVariantName = item.variant_name && item.variant_name.trim() !== "";
  const isVariant = hasVariant || (!!hasVariantName && !!item.variant_id);

  if (isVariant) {
    let name = item.variant_name?.trim() || "Variant";
    if (!name || name === "Variant") {
      for (const prod of products) {
        if (prod.variants && Array.isArray(prod.variants)) {
          const variant = prod.variants.find(
            (v: any) => v.id === item.variant_id,
          );
          if (variant) {
            name = variant.name || "Variant";
            break;
          }
        }
      }
    }
    return { name, id: item.variant_id, isVariant: true };
  }

  const product = products.find((p) => p.id === item.product_id);
  return {
    name: product?.name || "Product",
    id: item.product_id,
    isVariant: false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

function InventoryPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [adjustItem, setAdjustItem] = useState<
    (InventoryItem & { displayName: string }) | null
  >(null);
  const [addFormOpen, setAddFormOpen] = useState(false);

  // ── Data ──
  const { data: inventoryRaw, isLoading: isLoadingInv } = useGetInventory({
    store_id: Number(store_id),
  });
  const { data: productsData, isLoading: isLoadingProd } =
    useGetProduct(store_id);

  const isLoading = isLoadingInv || isLoadingProd;

  const inventory = Array.isArray(inventoryRaw) ? inventoryRaw : [];
  const products = Array.isArray(productsData)
    ? productsData
    : ((productsData as any)?.data ?? []);

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return inventory;
    return inventory.filter((item) => {
      const display = getDisplayData(item, products);
      return (
        display.name.toLowerCase().includes(q) ||
        display.id?.toString().includes(q)
      );
    });
  }, [inventory, products, search]);

  const openAdjust = (item: InventoryItem) => {
    const display = getDisplayData(item, products);
    setAdjustItem({ ...item, displayName: display.name });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Inventory List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button
              onClick={() => setAddFormOpen(true)}
              className="flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    NAME
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    TYPE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    QTY ON HAND
                  </TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                      <p className="text-sm text-neutral-400 mt-2">
                        Loading inventory...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((item, index) => {
                    const display = getDisplayData(item, products);
                    const qty = item.qty_on_hand ?? 0;
                    return (
                      <TableRow
                        key={item.id ?? index}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-neutral-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-800">
                          {display.name}
                        </TableCell>
                        <TableCell className="text-neutral-500 text-sm">
                          {display.id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              display.isVariant
                                ? "border-purple-200 text-purple-700 bg-purple-50"
                                : "border-blue-200 text-blue-700 bg-blue-50"
                            }
                          >
                            {display.isVariant ? "Variant" : "Product"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${qty === 0
                                ? "text-red-500"
                                : qty < 5
                                  ? "text-amber-500"
                                  : "text-green-600"
                              }`}
                          >
                            {qty}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAdjust(item)}
                            className="flex items-center gap-1 h-8 cursor-pointer ml-auto"
                          >
                            <SlidersHorizontal size={13} />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-neutral-400"
                    >
                      No inventory found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-sm text-neutral-400">Loading inventory...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item, index) => {
              const display = getDisplayData(item, products);
              const qty = item.qty_on_hand ?? 0;
              return (
                <div
                  key={item.id ?? index}
                  className="px-4 py-3 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {display.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${display.isVariant
                              ? "border-purple-200 text-purple-700 bg-purple-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                            }`}
                        >
                          {display.isVariant ? "Variant" : "Product"}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        ID: {display.id} · Qty:{" "}
                        <span
                          className={`font-semibold ${qty === 0
                              ? "text-red-500"
                              : qty < 5
                                ? "text-amber-500"
                                : "text-green-600"
                            }`}
                        >
                          {qty}
                        </span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAdjust(item)}
                      className="h-8 flex-shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <SlidersHorizontal size={13} />
                      Adjust
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No inventory found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${inventory.length} total)`}
          </p>
        </div>
      </div>

      {/* ── Add Inventory Dialog ── */}
      <AddInventoryForm
        open={addFormOpen}
        onClose={() => setAddFormOpen(false)}
        products={products}
      />

      {/* ── Adjust Stock Dialog ── */}
      <AdjustStockForm
        open={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        item={adjustItem}
      />
    </div>
  );
}

export default InventoryPage;
