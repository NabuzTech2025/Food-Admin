import { useState, useMemo } from "react";
import { Search, Loader2, Plus, Pencil, Trash2, Tag } from "lucide-react";
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
import { useGetCoupons, useDeleteCoupon } from "@/hooks/useCoupon";
import CouponForm from "@/components/Forms/CouponForm";
import { toast } from "sonner";
import type { Coupon } from "@/api/coupon";

function CouponsPage() {
  const { store_id } = useAdminStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: coupons, isLoading } = useGetCoupons(store_id);
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (Array.isArray(coupons) ? coupons : []).filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q))
    );
  }, [coupons, search]);

  const openAddForm = () => {
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCoupon(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCoupon(deleteId, {
      onSuccess: () => {
        toast.success("Coupon deleted successfully");
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete coupon");
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Coupons List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search coupon code..."
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

        {/* Content Table */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">#</TableHead>
                  <TableHead className="font-semibold text-neutral-700">CODE / NAME</TableHead>
                  <TableHead className="font-semibold text-neutral-700">TYPE</TableHead>
                  <TableHead className="font-semibold text-neutral-700">VALUE</TableHead>
                  <TableHead className="font-semibold text-neutral-700">MIN CART</TableHead>
                  <TableHead className="font-semibold text-neutral-700">LIMIT</TableHead>
                  <TableHead className="font-semibold text-neutral-700">STATUS</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-neutral-500">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-800 tracking-wide uppercase">{item.code}</span>
                          {item.name && <span className="text-xs text-neutral-500">{item.name}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs font-semibold text-primary border-primary/20 bg-primary/5">
                          {item.coupon_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-neutral-700 font-semibold">
                        {item.value ? item.value : "-"}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {item.min_cart_amount ? item.min_cart_amount : "-"}
                      </TableCell>
                      <TableCell className="text-neutral-500 text-xs">
                        {item.usage_limit ? `Limit: ${item.usage_limit}` : "Unlimited"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }
                        >
                          {item.is_active ? "Active" : "Inactive"}
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
                    <TableCell colSpan={8} className="text-center py-10 text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <Tag size={24} className="opacity-20" />
                        No coupons found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <div key={item.id} className="px-4 py-3 hover:bg-muted/30 flex justify-between gap-2 items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-800 tracking-wide uppercase">{item.code}</span>
                    <Badge variant="outline" className="capitalize text-[10px] font-semibold text-primary border-primary/20 bg-primary/5">
                      {item.coupon_type}
                    </Badge>
                    <Badge
                      className={`text-[10px] px-1.5 py-0 ${
                        item.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {item.name && <p className="text-xs text-neutral-500 mt-1">{item.name}</p>}
                  <p className="text-xs text-neutral-500 mt-1">
                    Value: <span className="font-semibold text-neutral-700">{item.value ?? "-"}</span>
                    {" • "}Min Cart: {item.min_cart_amount ?? "-"}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEditForm(item)} className="h-7 w-7 p-0 cursor-pointer">
                    <Pencil size={12} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)} className="h-7 w-7 p-0 cursor-pointer">
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-10 text-neutral-400 text-sm">
              No coupons found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${coupons?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      <CouponForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editingCoupon}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This coupon will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="animate-spin mr-1" size={14} />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CouponsPage;
