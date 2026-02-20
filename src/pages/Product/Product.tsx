import { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  // TableFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useGetProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/hooks/useProduct";
import ProductForm from "@/components/Forms/ProductForm";
import { toast } from "sonner";
import type { Product } from "@/api/product";
import { currentCurrency } from "@/utils/helper/currency_type";

function ProductPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: products, isLoading } = useGetProduct(store_id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const handleToggleStatus = (product: Product) => {
    updateProduct(
      {
        id: product.id,
        payload: {
          ...product,
          variants: product.variants || [],
          category_id: product.category_id,
          store_id: product.store_id,
          isActive: !product.isActive,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(
            `Product ${!product.isActive ? "activated" : "deactivated"}`,
          );
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to update status",
          );
        },
      },
    );
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (Array.isArray(products) ? products : []).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.item_code?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q),
    );
  }, [products, search]);

  const openAddForm = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };
  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct(deleteId, {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete product");
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/*
        LAYOUT TRICK for sticky table header + only rows scroll:
        - Outer card: flex flex-col + fixed height (100vh minus topbar)
        - Card header (title/search): flex-shrink-0 → never scrolls
        - Table wrapper: flex-1 overflow-hidden → takes remaining space
          - Inner scrollable div: overflow-auto h-full
            - TableHeader: sticky top-0 → sticks to top of THIS div
            - TableBody: rows scroll inside this div
        - Card footer: flex-shrink-0 → never scrolls
      */}
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header — NEVER scrolls ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Product List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
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

        {/* ── Desktop Table — only rows scroll ── */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          {/* THIS div scrolls — sticky header sticks to ITS top */}
          <div className="overflow-auto flex-1">
            <table className="w-full caption-bottom text-sm text-left">
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">
                    #
                  </TableHead>
                  <TableHead className="w-20 font-semibold text-neutral-700">
                    DISPLAY ORDER
                  </TableHead>
                  <TableHead className="w-16 font-semibold text-neutral-700">
                    IMAGE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    PRODUCT NAME
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    PRODUCT CODE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    CATEGORY
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    TAX
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    TYPE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    PRICE/VARIANTS
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    DISCOUNT PRICE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    STATUS
                  </TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-10">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-neutral-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {item.display_order ?? "-"}
                      </TableCell>
                      <TableCell>
                        {item.image_url ? (
                          <img
                            src={item.image_url.split("?")[0]}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-neutral-400">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {item.item_code || "-"}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.category?.name || "-"}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.tax
                          ? `${item.tax.name} (${item.tax.percentage}%)`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {item.type === "simple" ? (
                          <span>
                            {currentCurrency.symbol}
                            {item.price}
                          </span>
                        ) : (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-1 text-sm text-primary hover:underline outline-none">
                                <ChevronDown size={14} />
                                {item.variants?.length ?? 0} Variants
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                              <div className="p-3 border-b bg-muted/20">
                                <h4 className="font-semibold text-sm">
                                  Variants
                                </h4>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-transparent hover:bg-transparent">
                                      <TableHead className="h-8 text-xs">
                                        Name
                                      </TableHead>
                                      <TableHead className="h-8 text-xs text-right">
                                        Price
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {item.variants?.map((v, i) => (
                                      <TableRow
                                        key={i}
                                        className="hover:bg-muted/50"
                                      >
                                        <TableCell className="py-2 text-xs font-medium">
                                          {v.name}
                                        </TableCell>
                                        <TableCell className="py-2 text-xs text-right">
                                          <div className="flex flex-col items-end gap-0.5">
                                            <span
                                              className={
                                                v.discount_price > 0
                                                  ? "line-through text-neutral-400"
                                                  : ""
                                              }
                                            >
                                              {currentCurrency.symbol}
                                              {v.price}
                                            </span>
                                            {v.discount_price > 0 && (
                                              <span className="text-green-600 font-medium">
                                                {currentCurrency.symbol}
                                                {v.discount_price}
                                              </span>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.type === "simple" && item.discount_price > 0 ? (
                          <span className="text-sm text-green-600 font-medium">
                            {currentCurrency.symbol}
                            {item.discount_price}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          onClick={() => handleToggleStatus(item)}
                          className={`cursor-pointer ${
                            item.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
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
                            onClick={() => setDeleteId(item.id)}
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
                      colSpan={12}
                      className="text-center py-10 text-neutral-400"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <div key={item.id} className="px-4 py-3 hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url.split("?")[0]}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-neutral-400 flex-shrink-0">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.category?.name || "No category"}
                        {item.display_order != null &&
                          ` · Order: ${item.display_order}`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type}
                        </Badge>
                        <Badge
                          className={`text-xs ${item.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
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
                      onClick={() => setDeleteId(item.id)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                {item.type === "variable" && !!item.variants?.length && (
                  <div className="mt-2 ml-13">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 text-xs text-primary">
                          <ChevronDown size={12} />
                          {item.variants.length} Variants
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start">
                        <div className="p-3 border-b bg-muted/20">
                          <h4 className="font-semibold text-sm">Variants</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                          {item.variants.map((v, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-xs border-b last:border-0 pb-2 last:pb-0"
                            >
                              <span className="font-medium">{v.name}</span>
                              <div className="flex flex-col items-end">
                                <span
                                  className={
                                    v.discount_price > 0
                                      ? "line-through text-neutral-400"
                                      : ""
                                  }
                                >
                                  {currentCurrency.symbol}
                                  {v.price}
                                </span>
                                {v.discount_price > 0 && (
                                  <span className="text-green-600 font-medium">
                                    {currentCurrency.symbol}
                                    {v.discount_price}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No products found.
            </div>
          )}
        </div>

        {/* ── Footer — NEVER scrolls ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${products?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <ProductForm
        open={formOpen}
        onClose={handleFormClose}
        existingProducts={products ?? []}
        editData={editingProduct}
      />

      {/* ── Delete Dialog ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This product will be permanently
              deleted.
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

export default ProductPage;
