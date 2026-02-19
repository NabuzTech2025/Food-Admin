// src/pages/Admin/Category.tsx
import { useState } from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
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
import {
  useGetCategory,
  useDeleteCategory,
  useChangeCategoryStatus,
} from "@/hooks/useCategory";
import CategoryForm from "@/components/Forms/CategoryForm";
import type { Category } from "@/api/category";

function CategoryPage() {
  const { store_id } = useAdminStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useGetCategory(store_id);
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategory();
  const { mutateAsync: changeStatus } = useChangeCategoryStatus();

  const filtered = (Array.isArray(categories) ? categories : []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.tax?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openAddForm = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory(deletingId);
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (item: Category) => {
    try {
      await changeStatus({
        id: item.id,
        payload: {
          isActive: !item.isActive,
          name: item.name,
          store_id: store_id!,
          tax_id: item.tax?.id ?? null,
          image_url: item.image_url ?? "",
          description: item.description ?? "",
          display_order: item.display_order,
        },
      });
      toast.success(
        `Category ${!item.isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change status");
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Card Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Category List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Button
              onClick={openAddForm}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 font-semibold text-neutral-700">
                  #
                </TableHead>
                <TableHead className="w-16 font-semibold text-neutral-700">
                  Order
                </TableHead>
                <TableHead className="w-16 font-semibold text-neutral-700">
                  Image
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  NAME
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  DESCRIPTION
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  TAX
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
                  <TableCell colSpan={8} className="text-center py-10">
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
                    <TableCell className="text-neutral-500 max-w-[180px] truncate">
                      {item.description
                        ? item.description.length > 30
                          ? `${item.description.slice(0, 30)}...`
                          : item.description
                        : "-"}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {item.tax
                        ? `${item.tax.name} (${item.tax.percentage}%)`
                        : "-"}
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
                          className="flex items-center gap-1 h-8"
                        >
                          <Pencil size={13} />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeletingId(item.id);
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
                    colSpan={8}
                    className="text-center py-10 text-neutral-400"
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
              >
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
                      {item.tax
                        ? `${item.tax.name} (${item.tax.percentage}%)`
                        : "No tax"}
                      {item.display_order != null &&
                        ` · Order: ${item.display_order}`}
                    </p>
                    <Badge
                      onClick={() => handleToggleStatus(item)}
                      className={`mt-1 text-xs cursor-pointer ${
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditForm(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeletingId(item.id);
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
              No categories found.
            </div>
          )}
        </div>

        {/* Footer count */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${categories?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      {/* Add / Edit Form */}
      <CategoryForm
        open={formOpen}
        onClose={handleFormClose}
        existingCategories={categories ?? []}
        editData={editingCategory}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
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

export default CategoryPage;
