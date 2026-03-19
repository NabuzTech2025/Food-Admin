// src/pages/Admin/GroupItem.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
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
import { useGetGroupItem, useDeleteGroupItem } from "@/hooks/useGroupItem";
import GroupItemForm from "@/components/Forms/GroupItemForm";
import { toast } from "sonner";
import type { GroupItem } from "@/api/groupitem";

function GroupItemPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: items, isLoading } = useGetGroupItem(store_id);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteGroupItem();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (Array.isArray(items) ? items : []).filter(
      (i) =>
        i.topping?.name?.toLowerCase().includes(q) ||
        i.group?.name?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const openAddForm = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEditForm = (item: GroupItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteItem(deleteId, {
      onSuccess: () => {
        toast.success("Group item deleted successfully");
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete");
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/*
        ╔══════════════════════════════════════════════════════════════╗
        ║  STEP 1 — Outer Card: Fixed Height + Flex Column            ║
        ║                                                              ║
        ║  "flex flex-col"         → andar ka content upar se neeche  ║
        ║                            lagega (header → table → footer) ║
        ║                                                              ║
        ║  "h-[calc(100vh-80px)]"  → poori screen ki height lo,       ║
        ║                            minus 80px (topbar ki height)    ║
        ║                            Isse card screen se bada nahi    ║
        ║                            hoga aur scroll andar banega     ║
        ║                                                              ║
        ║  ⚠️ 80px = tumhara topbar — bada/chhota ho to yeh badlo    ║
        ╚══════════════════════════════════════════════════════════════╝
      */}
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/*
          ══════════════════════════════════════════════════════════════
          STEP 2 — Card Header: Hamesha Upar Fixed
          ══════════════════════════════════════════════════════════════
          "flex-shrink-0" → yeh header kabhi chhota nahi hoga
                            chahe neeche kitna bhi content ho
                            Title, Search, Add button — sab yahan
        */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Group Item List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search topping or group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-60"
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

        {/*
          ══════════════════════════════════════════════════════════════
          STEP 3 — Desktop Table Wrapper: Bacha hua Space Lo
          ══════════════════════════════════════════════════════════════
          "flex-1"    → header aur footer ke baad jo bhi space bache,
                        yeh div poora le lega (grow karta hai)

          "min-h-0"   → ZARURI HAI! Bina iske flex-1 overflow ho
                        jaata hai. Yeh batata hai ki div apni
                        minimum height 0 rakh sakta hai
        */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          {/*
            ══════════════════════════════════════════════════════════
            STEP 4 — Scroll Container: Scroll Yahan Hoga
            ══════════════════════════════════════════════════════════
            "overflow-auto" → SCROLL YAHAN BANEGA
                              Sirf is div ke andar wala content
                              scroll karega — bahar kuch nahi hilega

            "flex-1"        → poori available height lo

            ⚠️ IMPORTANT: "sticky" sirf tab kaam karta hai jab
               scroll isi div ke andar ho. Page scroll pe
               sticky kaam nahi karta — isliye yeh div zaruri hai
          */}
          <div className="overflow-auto flex-1">
            <Table>
              {/*
                ══════════════════════════════════════════════════════
                STEP 5 — TableHeader: Scroll pe Upar Chipakna
                ══════════════════════════════════════════════════════
                "sticky top-0" → jab rows scroll hongi, yeh header
                                  upar chipka rahega — neeche nahi jaega

                "z-10"         → rows ke upar layer mein rahega
                                  taaki rows iske peeche se jaen

                "bg-white"     → rows iske neeche se dikhein nahi,
                                  background white rakho

                "shadow-sm"    → scroll hone pe thodi si shadow
                                  aati hai — alag dikhne ke liye
              */}
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    TOPPING
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    GROUP
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    DISPLAY ORDER
                  </TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/*
                ══════════════════════════════════════════════════════
                STEP 6 — TableBody: Yeh Rows Scroll Hongi
                ══════════════════════════════════════════════════════
                Koi special class nahi — bas normal rows
                Scroll Step 4 ke div mein hoti hai, isliye
                header upar fixed rahta hai aur sirf yeh
                content neeche jaata hai
              */}
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
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
                        {item.topping?.name || "-"}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.group?.name || "-"}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {item.display_order ?? 0}
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
                      colSpan={5}
                      className="text-center py-10 text-neutral-400"
                    >
                      No group items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/*
          ══════════════════════════════════════════════════════════════
          Mobile Cards — Same Concept, Alag Layout
          ══════════════════════════════════════════════════════════════
          "flex-1"          → bacha hua space lo (Step 3 jaisa)
          "overflow-y-auto" → mobile pe bhi sirf yeh div scroll karega
                              header upar fixed rahega (Step 2 ki wajah se)
        */}
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
                      {item.topping?.name || "-"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Group: {item.group?.name || "-"} · Order:{" "}
                      {item.display_order ?? 0}
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
                      onClick={() => setDeleteId(item.id)}
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
              No group items found.
            </div>
          )}
        </div>

        {/*
          ══════════════════════════════════════════════════════════════
          STEP 7 — Footer: Hamesha Neeche Fixed
          ══════════════════════════════════════════════════════════════
          "flex-shrink-0" → yeh footer kabhi chhota nahi hoga
                            hamesha neeche chipka rahega
                            Step 2 (header) jaisi hi trick
        */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${items?.length ?? 0} total)`}
          </p>
        </div>
      </div>

      <GroupItemForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editingItem}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This group item will be permanently
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

export default GroupItemPage;
