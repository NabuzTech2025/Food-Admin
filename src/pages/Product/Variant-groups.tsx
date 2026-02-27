// src/pages/Admin/ProductGroup.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useGetProductGroup,
  useDeleteProductGroup,
  useDeleteProductVariantGroup,
} from "@/hooks/useProductGroup";
import { useGetProduct } from "@/hooks/useProduct";
import ProductGroupForm from "@/components/Forms/ProductGroupForm";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "product" | "variant";

interface DeleteTarget {
  id: number;
  mode: ViewMode;
}

interface EditTarget {
  item: any;
  mode: ViewMode;
}

function ProductGroupPage() {
  const { store_id } = useAdminStore();

  const [viewMode, setViewMode] = useState<ViewMode>("product");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // ── Data fetching ──
  const { data: productGroups, isLoading: isLoadingGroups } =
    useGetProductGroup(store_id);
  const { data: products, isLoading: isLoadingProducts } =
    useGetProduct(store_id);

  const isLoading = isLoadingGroups || isLoadingProducts;

  const { mutate: deletePG, isPending: isDeletingPG } = useDeleteProductGroup();
  const { mutate: deleteVG, isPending: isDeletingVG } =
    useDeleteProductVariantGroup();

  // ── Derive variant groups from products ──
  const variantGroups = useMemo(() => {
    const productList = Array.isArray(products)
      ? products
      : ((products as any)?.data ?? []);

    const result: any[] = [];
    productList.forEach((product: any) => {
      if (product?.type === "variable" && product?.variants?.length > 0) {
        product.variants.forEach((variant: any) => {
          if (variant?.enriched_topping_groups?.length > 0) {
            variant.enriched_topping_groups.forEach((toppingGroup: any) => {
              result.push({
                id: toppingGroup.id,
                variant,
                parentProduct: product,
                group: toppingGroup,
                variantId: variant.id,
                groupId: toppingGroup.id,
                originalProductId: product.id,
              });
            });
          }
        });
      }
    });
    return result;
  }, [products]);

  // ── Filter simple product groups ──
  const productGroupList = useMemo(() => {
    const productList = Array.isArray(products)
      ? products
      : ((products as any)?.data ?? []);

    return (Array.isArray(productGroups) ? productGroups : []).filter(
      (item: any) => {
        const product = productList.find((p: any) => p.id === item.product?.id);
        return product?.type === "simple";
      },
    );
  }, [productGroups, products]);

  // ── Active list based on tab ──
  const activeList = viewMode === "product" ? productGroupList : variantGroups;

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return activeList;
    return activeList.filter(
      (item: any) =>
        item.product?.name?.toLowerCase().includes(q) ||
        item.variant?.name?.toLowerCase().includes(q) ||
        item.parentProduct?.name?.toLowerCase().includes(q) ||
        item.group?.name?.toLowerCase().includes(q),
    );
  }, [activeList, search]);

  // ── Handlers ──
  const openAddForm = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const openEditForm = (item: any) => {
    setEditTarget({ item, mode: viewMode });
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const onSuccess = () => {
      toast.success("Deleted successfully");
      setDeleteTarget(null);
    };
    const onError = (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete");
      setDeleteTarget(null);
    };

    if (deleteTarget.mode === "product") {
      deletePG(deleteTarget.id, { onSuccess, onError });
    } else {
      deleteVG(deleteTarget.id, { onSuccess, onError });
    }
  };

  const isDeleting = isDeletingPG || isDeletingVG;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header ── */}
        <div className="flex-shrink-0 border-b border-border px-4 sm:px-5 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Shadcn Tabs */}
            <Tabs
              value={viewMode}
              onValueChange={(val) => {
                setViewMode(val as ViewMode);
                setSearch("");
              }}
            >
              <TabsList className="h-9">
                <TabsTrigger
                  value="product"
                  className="cursor-pointer px-5 text-sm"
                >
                  Product Groups
                </TabsTrigger>
                <TabsTrigger
                  value="variant"
                  className="cursor-pointer px-5 text-sm"
                >
                  Variant Groups
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search + Add */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <Input
                  placeholder={
                    viewMode === "product"
                      ? "Search product or group..."
                      : "Search variant or group..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button
                onClick={openAddForm}
                className="flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add New</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
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
                  {viewMode === "variant" && (
                    <TableHead className="font-semibold text-neutral-700">
                      PARENT PRODUCT
                    </TableHead>
                  )}
                  <TableHead className="font-semibold text-neutral-700">
                    {viewMode === "product" ? "PRODUCT" : "VARIANT"}
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    GROUP
                  </TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={viewMode === "variant" ? 5 : 4}
                      className="text-center py-10"
                    >
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((item: any, index: number) => (
                    <TableRow
                      key={`${item.id}-${index}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-neutral-500">
                        {index + 1}
                      </TableCell>
                      {viewMode === "variant" && (
                        <TableCell className="text-neutral-600">
                          {item.parentProduct?.name || "-"}
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-neutral-800">
                        {viewMode === "product"
                          ? item.product?.name || "-"
                          : item.variant?.name || "-"}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.group?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(item)}
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Pencil size={13} />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setDeleteTarget({ id: item.id, mode: viewMode })
                            }
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={viewMode === "variant" ? 5 : 4}
                      className="text-center py-10 text-neutral-400"
                    >
                      No{" "}
                      {viewMode === "product"
                        ? "product groups"
                        : "variant groups"}{" "}
                      found.
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
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item: any, index: number) => (
              <div
                key={`${item.id}-${index}`}
                className="px-4 py-3 hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {viewMode === "product"
                        ? item.product?.name
                        : item.variant?.name || "-"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {viewMode === "variant" &&
                        `Product: ${item.parentProduct?.name} · `}
                      Group: {item.group?.name || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditForm(item)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setDeleteTarget({ id: item.id, mode: viewMode })
                      }
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No {viewMode === "product" ? "product groups" : "variant groups"}{" "}
              found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${activeList.length} total)`}
          </p>
        </div>
      </div>

      <ProductGroupForm
        open={formOpen}
        onClose={handleFormClose}
        editTarget={editTarget}
        defaultMode={viewMode}
      />

      {/* ── Delete Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {deleteTarget?.mode === "product"
                ? "Product Group"
                : "Variant Group"}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This group assignment will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && (
                <Loader2 className="animate-spin mr-1" size={14} />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProductGroupPage;
