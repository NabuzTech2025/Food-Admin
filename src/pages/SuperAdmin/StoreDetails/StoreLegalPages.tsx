import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  useGetStoreLegalPages,
  useDeleteStoreLegalPage,
} from "@/hooks/useStoreLegalPages";
import type { StoreLegalPage } from "@/api/storeLegalPages";

function StoreLegalPagesPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = useState<StoreLegalPage | null>(
    null,
  );

  const { data: pagesRaw, isLoading } = useGetStoreLegalPages(storeId);
  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteStoreLegalPage();

  const pages = (pagesRaw ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);

  const openAddForm = () => {
    navigate(`/super/stores/${storeId}/legal-pages/form`);
  };
  const openEditForm = (item: StoreLegalPage) => {
    navigate(`/super/stores/${storeId}/legal-pages/form`, {
      state: { pageData: item },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Legal page deleted successfully");
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.detail || "Failed to delete");
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Legal Pages
          </h2>
          <Button
            onClick={openAddForm}
            disabled={!storeId}
            className="flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Page</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
              <TableRow className="bg-muted/50">
                <TableHead className="w-10 font-semibold text-neutral-700">
                  #
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  TITLE
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  SLUG
                </TableHead>
                <TableHead className="font-semibold text-neutral-700">
                  LANGUAGE
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
              ) : pages.length > 0 ? (
                pages.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-neutral-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-800">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {item.slug}
                    </TableCell>
                    <TableCell className="text-neutral-700 uppercase">
                      {item.language}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? "default" : "outline"}>
                        {item.is_published ? "Published" : "Hidden"}
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
                          <Pencil size={13} /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(item)}
                          className="flex items-center gap-1 h-8 cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
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
                    No legal pages yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{pages.length}</strong>
          </p>
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Legal Page?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-neutral-800">
                {deleteTarget?.title}
              </span>{" "}
              will be permanently deleted. This action cannot be undone.
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

export default StoreLegalPagesPage;
