// src/components/Forms/DeliveryZoneForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useAddDeliveryZone,
  useUpdateDeliveryZone,
} from "@/hooks/useDeliveryZone";
import type { DeliveryZone } from "@/api/deliveryZone";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  min_distance: string;
  max_distance: string;
  minimum_order_amount: string;
  delivery_fee: string;
  delivery_time: string;
  is_active: boolean;
}

interface DeliveryZoneFormProps {
  open: boolean;
  onClose: () => void;
  editData?: DeliveryZone | null;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function DeliveryZoneForm({ open, onClose, editData }: DeliveryZoneFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addItem, isPending: isAdding } = useAddDeliveryZone();
  const { mutateAsync: updateItem, isPending: isUpdating } =
    useUpdateDeliveryZone();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          min_distance: String(editData.min_distance),
          max_distance: String(editData.max_distance),
          minimum_order_amount: String(editData.minimum_order_amount),
          delivery_fee: String(editData.delivery_fee),
          delivery_time: String(editData.delivery_time),
          is_active: editData.is_active,
        });
      } else {
        reset({
          min_distance: "",
          max_distance: "",
          minimum_order_amount: "",
          delivery_fee: "",
          delivery_time: "",
          is_active: true,
        });
      }
    }
  }, [open, editData]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      min_distance: parseFloat(data.min_distance),
      max_distance: parseFloat(data.max_distance),
      minimum_order_amount: parseFloat(data.minimum_order_amount),
      delivery_fee: parseFloat(data.delivery_fee),
      delivery_time: parseInt(data.delivery_time),
      is_active: data.is_active,
      store_id: Number(store_id),
    };

    try {
      if (isEditMode) {
        await updateItem({ id: editData!.id, payload });
        toast.success("Delivery zone updated successfully");
      } else {
        await addItem(payload);
        toast.success("Delivery zone added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Edit Delivery Zone" : "Add Delivery Zone"}
          </DialogTitle>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            {/* Min + Max Distance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Min Distance (km) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  min={0}
                  {...register("min_distance", { required: "Required" })}
                />
                <FieldError message={errors.min_distance?.message} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Max Distance (km) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  min={0}
                  {...register("max_distance", { required: "Required" })}
                />
                <FieldError message={errors.max_distance?.message} />
              </div>
            </div>

            {/* Min Order + Delivery Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Min Order Amount <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  min={0}
                  {...register("minimum_order_amount", {
                    required: "Required",
                  })}
                />
                <FieldError message={errors.minimum_order_amount?.message} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Delivery Fee <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  step="0.1"
                  min={0}
                  {...register("delivery_fee", { required: "Required" })}
                />
                <FieldError message={errors.delivery_fee?.message} />
              </div>
            </div>

            {/* Delivery Time */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">
                Delivery Time (minutes){" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 30"
                min={1}
                {...register("delivery_time", { required: "Required" })}
              />
              <FieldError message={errors.delivery_time?.message} />
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-muted/20">
              <div>
                <p className="text-sm font-semibold text-neutral-700">Active</p>
                <p className="text-xs text-neutral-500">
                  Enable or disable this delivery zone
                </p>
              </div>
              <Switch
                checked={watch("is_active")}
                onCheckedChange={(val) => setValue("is_active", val)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 px-8 py-5 border-t bg-white rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-32 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-36 h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-1" size={16} />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Zone"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DeliveryZoneForm;
