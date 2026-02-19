// src/pages/Admin/Tax.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Pencil, Search, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  useGetTax,
  useAddTax,
  useUpdateTax,
  useDeleteTax,
} from "@/hooks/useTax";
import type { Tax } from "@/api/tax";

interface TaxFormData {
  name: string;
  percentage: string;
}

function TaxPage() {
  const { store_id } = useAdminStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: taxes, isLoading } = useGetTax(store_id);
  const { mutateAsync: addTax, isPending: isAdding } = useAddTax();
  const { mutateAsync: updateTax, isPending: isUpdating } = useUpdateTax();
  const { mutateAsync: deleteTax, isPending: isDeleting } = useDeleteTax();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxFormData>();

  const openAddModal = () => {
    setEditingTax(null);
    reset({ name: "", percentage: "" });
    setModalOpen(true);
  };

  const openEditModal = (tax: Tax) => {
    setEditingTax(tax);
    reset({ name: tax.name, percentage: String(tax.percentage) });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTax(null);
    reset();
  };

  const onSubmit = async (data: TaxFormData) => {
    const payload = {
      name: data.name,
      percentage: parseFloat(data.percentage),
      store_id: store_id!,
    };
    try {
      if (editingTax) {
        await updateTax({ id: editingTax.id, payload });
        toast.success("Tax updated successfully");
      } else {
        await addTax(payload);
        toast.success("Tax added successfully");
      }
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteTax(deletingId);
      toast.success("Tax deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete tax");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const filtered = (Array.isArray(taxes) ? taxes : []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Card Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">Tax List</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search taxes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            {/* Add button */}
            <Button
              onClick={openAddModal}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Desktop Table — hidden on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 font-semibold text-neutral-700">
                  #
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  NAME
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  PERCENTAGE
                </TableHead>
                <TableHead className="text-right font-semibold text-neutral-700">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2
                      className="animate-spin mx-auto text-primary"
                      size={24}
                    />
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((tax, index) => (
                  <TableRow key={tax.id} className="hover:bg-muted/30">
                    <TableCell className="text-neutral-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-800">
                      {tax.name}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {tax.percentage}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(tax)}
                          className="flex items-center gap-1 h-8"
                        >
                          <Pencil size={13} />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeletingId(tax.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="flex items-center gap-1 h-8"
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
                    colSpan={4}
                    className="text-center py-10 text-neutral-400"
                  >
                    No taxes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards — shown only on mobile */}
        <div className="sm:hidden divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((tax, index) => (
              <div
                key={tax.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
              >
                {/* Left: index + info */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 w-5">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {tax.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {tax.percentage}%
                    </p>
                  </div>
                </div>
                {/* Right: actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(tax)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeletingId(tax.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No taxes found.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>{editingTax ? "Edit Tax" : "Add New Tax"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tax Name</label>
              <Input
                placeholder="e.g. VAT"
                {...register("name", { required: "Tax name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Percentage</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  min="0"
                  max="100"
                  step="0.01"
                  className="pr-8"
                  {...register("percentage", {
                    required: "Percentage is required",
                    min: { value: 0, message: "Min is 0" },
                    max: { value: 100, message: "Max is 100" },
                  })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  %
                </span>
              </div>
              {errors.percentage && (
                <p className="text-xs text-destructive">
                  {errors.percentage.message}
                </p>
              )}
            </div>
            <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding || isUpdating}
                className="w-full sm:w-auto"
              >
                {isAdding || isUpdating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : editingTax ? (
                  "Update Tax"
                ) : (
                  "Save Tax"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TaxPage;
