// src/components/Forms/AdjustStockForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, PackageCheck, Tag, Hash, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAdjustInventory } from "@/hooks/useInventory";
import type { InventoryItem } from "@/api/inventory";

interface FormData {
  newQty: string;
}

interface AdjustStockFormProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem & { displayName: string } | null;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

function AdjustStockForm({ open, onClose, item }: AdjustStockFormProps) {
  const { store_id } = useAdminStore();
  const { mutateAsync: adjust, isPending } = useAdjustInventory();

  const currentQty = item?.qty_on_hand ?? 0;
  const isVariant = !!item?.variant_id && !item?.product_id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ mode: "onChange" });

  useEffect(() => {
    if (open && item) {
      reset({ newQty: String(currentQty) });
    }
  }, [open, item]);

  const handleClose = () => {
    reset({ newQty: "" });
    onClose();
  };

  const newQtyValue = parseInt(watch("newQty") ?? "0") || 0;
  const delta = newQtyValue - currentQty;

  const onSubmit = async (data: FormData) => {
    if (!item) return;
    const newQty = parseInt(data.newQty);
    const adjustDelta = newQty - currentQty;

    const payload: any = {
      store_id: Number(store_id),
      delta: adjustDelta,
    };

    if (item.product_id) payload.product_id = item.product_id;
    else if (item.variant_id) payload.variant_id = item.variant_id;

    try {
      await adjust(payload);
      toast.success(
        `Stock ${adjustDelta >= 0 ? "increased" : "decreased"} by ${Math.abs(adjustDelta)} units`,
      );
      handleClose();
    } catch (err: any) {
      const errData = err?.response?.data;
      const msg =
        typeof errData === "string"
          ? errData
          : errData?.detail || errData?.error || "Failed to adjust inventory";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col gap-0">

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <PackageCheck size={20} className="text-primary" />
            Adjust Stock Quantity
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="px-8 py-6 space-y-5">

            {/* ── Item Details Card ── */}
            <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
              {/* Card Header */}
              <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
                <p className="text-sm font-bold text-neutral-800 truncate">
                  {item?.displayName ?? "—"}
                </p>
                <Badge
                  variant="outline"
                  className={isVariant
                    ? "border-purple-200 text-purple-700 bg-purple-50 flex-shrink-0 ml-2"
                    : "border-blue-200 text-blue-700 bg-blue-50 flex-shrink-0 ml-2"
                  }
                >
                  {isVariant ? "Variant" : "Product"}
                </Badge>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Hash size={11} /> ID
                  </span>
                  <span className="text-sm font-semibold text-neutral-700">
                    {isVariant ? item?.variant_id : item?.product_id ?? "—"}
                  </span>
                </div>

                <div className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Layers size={11} /> Type
                  </span>
                  <span className="text-sm font-semibold text-neutral-700">
                    {isVariant ? "Variant" : "Product"}
                  </span>
                </div>

                <div className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Tag size={11} /> Current Qty
                  </span>
                  <span className={`text-sm font-bold ${
                    currentQty === 0
                      ? "text-red-500"
                      : currentQty < 5
                      ? "text-amber-500"
                      : "text-green-600"
                  }`}>
                    {currentQty}
                  </span>
                </div>
              </div>
            </div>

            {/* ── New Quantity Input ── */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">
                New Quantity <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                placeholder="Enter new quantity"
                min={0}
                className="h-11 text-base"
                {...register("newQty", {
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
              />
              <FieldError message={errors.newQty?.message} />
            </div>

            {/* ── Delta Preview ── */}
            {watch("newQty") && !errors.newQty && (
              <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border ${
                delta > 0
                  ? "bg-green-50 text-green-700 border-green-200"
                  : delta < 0
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-muted text-neutral-500 border-border"
              }`}>
                <span className="text-lg font-bold">
                  {delta > 0 ? `+${delta}` : delta}
                </span>
                <span>
                  {delta > 0
                    ? "units will be added"
                    : delta < 0
                    ? "units will be removed"
                    : "No change"}
                </span>
              </div>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-8 py-5 border-t bg-white rounded-b-xl">
            <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-32 h-10">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-40 h-10">
              {isPending ? (
                <><Loader2 className="animate-spin mr-1" size={16} />Updating...</>
              ) : "Update Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdjustStockForm;