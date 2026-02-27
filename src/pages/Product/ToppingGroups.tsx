// src/pages/Admin/ToppingGroup.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Plus } from "lucide-react";
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
  useGetToppingGroup,
  useDeleteToppingGroup,
  useReactivateToppingGroup,
} from "@/hooks/useToppingGroup";
import ToppingGroupForm from "@/components/Forms/ToppingGroupForm";
import { toast } from "sonner";
import type { ToppingGroup } from "@/api/toppingGroup";

function ToppingGroupPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ToppingGroup | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    type: "delete" | "restore";
  } | null>(null);

  const { data: groups, isLoading } = useGetToppingGroup(store_id);
  const { mutate: deleteMutate, isPending: isDeleting } =
    useDeleteToppingGroup();
  const { mutate: reactivateMutate, isPending: isRestoring } =
    useReactivateToppingGroup();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (Array.isArray(groups) ? groups : []).filter((g) =>
      g.name.toLowerCase().includes(q),
    );
  }, [groups, search]);

  const openAddForm = () => {
    setEditingGroup(null);
    setFormOpen(true);
  };
  const openEditForm = (g: ToppingGroup) => {
    setEditingGroup(g);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingGroup(null);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") {
      deleteMutate(confirmAction.id, {
        onSuccess: () => {
          toast.success("Topping group deleted successfully");
          setConfirmAction(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to delete");
          setConfirmAction(null);
        },
      });
    } else {
      reactivateMutate(confirmAction.id, {
        onSuccess: () => {
          toast.success("Topping group restored successfully");
          setConfirmAction(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to restore");
          setConfirmAction(null);
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Topping Group List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search groups..."
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
                    MIN SELECT
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    MAX SELECT
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    REQUIRED
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
                    <TableCell colSpan={7} className="text-center py-10">
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
                      <TableCell className="font-medium text-neutral-800">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.min_select ?? 0}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.max_select ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.is_required
                              ? "border-orange-400 text-orange-600"
                              : ""
                          }
                        >
                          {item.is_required ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                          }
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
                            variant={item.isActive ? "destructive" : "outline"}
                            onClick={() =>
                              setConfirmAction({
                                id: item.id,
                                type: item.isActive ? "delete" : "restore",
                              })
                            }
                            className={`h-8 cursor-pointer ${!item.isActive ? "border-green-500 text-green-600 hover:bg-green-50" : ""}`}
                          >
                            {item.isActive ? "Delete" : "Restore"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-neutral-400"
                    >
                      No topping groups found.
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Min: {item.min_select} · Max: {item.max_select} ·{" "}
                      {item.is_required ? "Required" : "Optional"}
                    </p>
                    <Badge
                      className={`mt-1 text-xs ${
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
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
                      variant={item.isActive ? "destructive" : "outline"}
                      onClick={() =>
                        setConfirmAction({
                          id: item.id,
                          type: item.isActive ? "delete" : "restore",
                        })
                      }
                      className={`h-8 px-2 text-xs cursor-pointer ${!item.isActive ? "border-green-500 text-green-600 hover:bg-green-50" : ""}`}
                    >
                      {item.isActive ? "Delete" : "Restore"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No topping groups found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${groups?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      <ToppingGroupForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editingGroup}
      />

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete"
                ? "Delete Topping Group?"
                : "Restore Topping Group?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? "This group will be deactivated. You can restore it later."
                : "This group will be restored and marked as active."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting || isRestoring}
              className={
                confirmAction?.type === "delete"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
            >
              {(isDeleting || isRestoring) && (
                <Loader2 className="animate-spin mr-1" size={14} />
              )}
              {confirmAction?.type === "delete" ? "Delete" : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ToppingGroupPage;
