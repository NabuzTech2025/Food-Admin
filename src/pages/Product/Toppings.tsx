// src/pages/Admin/Topping.tsx
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
  useGetTopping,
  useDeleteTopping,
  useReactivateTopping,
} from "@/hooks/useTopping";
import ToppingForm from "@/components/Forms/Topping";
import { toast } from "sonner";
import type { Topping } from "@/api/topping";
import { currentCurrency } from "@/utils/helper/currency_type";

function ToppingPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    type: "delete" | "restore";
  } | null>(null);

  const { data: toppings, isLoading } = useGetTopping(store_id);

  // ── TEMPORARY DEBUG — network mein check karne ke liye ──
  console.log("store_id:", store_id);
  console.log("toppings:", toppings);
  console.log("isLoading:", isLoading);
  // ────────────────────────────────────────────────────────

  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteTopping();
  const { mutate: reactivateMutate, isPending: isRestoring } =
    useReactivateTopping();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (Array.isArray(toppings) ? toppings : []).filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q),
    );
  }, [toppings, search]);

  const openAddForm = () => {
    setEditingTopping(null);
    setFormOpen(true);
  };
  const openEditForm = (t: Topping) => {
    setEditingTopping(t);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTopping(null);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") {
      deleteMutate(confirmAction.id, {
        onSuccess: () => {
          toast.success("Topping deleted successfully");
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
          toast.success("Topping restored successfully");
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
            Topping List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search toppings..."
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
                    DESCRIPTION
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    PRICE
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
                    <TableCell colSpan={6} className="text-center py-10">
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
                      <TableCell className="text-neutral-500 max-w-[220px] truncate">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {currentCurrency.symbol}
                        {parseFloat(String(item.price)).toFixed(2)}
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
                            className={`h-8 cursor-pointer ${
                              !item.isActive
                                ? "border-green-500 text-green-600 hover:bg-green-50"
                                : ""
                            }`}
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
                      colSpan={6}
                      className="text-center py-10 text-neutral-400"
                    >
                      No toppings found.
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
                      {currentCurrency.symbol}
                      {parseFloat(String(item.price)).toFixed(2)}
                      {item.description && ` · ${item.description}`}
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
                      className={`h-8 px-2 text-xs cursor-pointer ${
                        !item.isActive
                          ? "border-green-500 text-green-600 hover:bg-green-50"
                          : ""
                      }`}
                    >
                      {item.isActive ? "Delete" : "Restore"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No toppings found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${toppings?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      <ToppingForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editingTopping}
      />

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete"
                ? "Delete Topping?"
                : "Restore Topping?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? "This topping will be deactivated. You can restore it later."
                : "This topping will be restored and marked as active."}
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

export default ToppingPage;
