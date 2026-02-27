// src/pages/Admin/Allergy/AddAllergy.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useGetAllergy, useDeleteAllergy } from "@/hooks/useAllergy";
import AllergyForm from "@/components/Forms/AllergyForm";
import { toast } from "sonner";
import type { Allergy } from "@/api/allergy";

function AddAllergyPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: allergies, isLoading } = useGetAllergy(store_id);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteAllergy();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (Array.isArray(allergies) ? allergies : []).filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)),
    );
  }, [allergies, search]);

  const openAddForm = () => { setEditingAllergy(null); setFormOpen(true); };
  const openEditForm = (a: Allergy) => { setEditingAllergy(a); setFormOpen(true); };
  const handleFormClose = () => { setFormOpen(false); setEditingAllergy(null); };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteItem(deleteId, {
      onSuccess: () => { toast.success("Allergy deleted successfully"); setDeleteId(null); },
      onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to delete"); setDeleteId(null); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">

        {/* ── Card Header ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">Allergy List</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search allergies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            <Button onClick={openAddForm} className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
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
                  <TableHead className="w-10 font-semibold text-neutral-700">#</TableHead>
                  <TableHead className="font-semibold text-neutral-700">ALLERGY NAME</TableHead>
                  <TableHead className="font-semibold text-neutral-700">DESCRIPTION</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-neutral-500">{index + 1}</TableCell>
                      <TableCell className="font-medium text-neutral-800">{item.name}</TableCell>
                      <TableCell className="text-neutral-600 max-w-md">
                        {/* Description HTML render */}
                        <div
                          className="text-sm line-clamp-2 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.description || "-" }}
                        />
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
                    <TableCell colSpan={4} className="text-center py-10 text-neutral-400">
                      No allergies found.
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
            filtered.map((item) => (
              <div key={item.id} className="px-4 py-3 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                    <div
                      className="text-xs text-neutral-500 mt-0.5 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: item.description || "-" }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEditForm(item)} className="h-8 w-8 p-0 cursor-pointer">
                      <Pencil size={13} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)} className="h-8 w-8 p-0 cursor-pointer">
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">No allergies found.</div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${allergies?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      <AllergyForm open={formOpen} onClose={handleFormClose} editData={editingAllergy} />

      {/* ── Delete Dialog ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allergy?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This allergy will be permanently deleted.
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

export default AddAllergyPage;