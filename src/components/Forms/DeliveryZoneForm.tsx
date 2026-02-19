// src/components/Admin/DeliveryZoneForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useAddDeliveryZone,
  useUpdateDeliveryZone,
} from "@/hooks/useDeliveryZone";
import type { DeliveryZone } from "@/api/deliveryZones";

// ── types ────────────────────────────────────────────────────────
interface ZoneFormData {
  max_distance: string;
  minimum_order_amount: string;
  delivery_fee: string;
  delivery_time: string;
}

interface DeliveryZoneFormProps {
  open: boolean;
  onClose: () => void;
  editingZone?: DeliveryZone | null; // null/undefined = Add mode
  lastMaxDistance?: number; // auto-filled as min_distance for new zones
}

// ── field wrapper ────────────────────────────────────────────────
function FormField({
  label,
  suffix,
  error,
  children,
}: {
  label: string;
  suffix?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <div className="relative">
        {children}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── component ────────────────────────────────────────────────────
function DeliveryZoneForm({
  open,
  onClose,
  editingZone,
  lastMaxDistance = 0,
}: DeliveryZoneFormProps) {
  const { store_id } = useAdminStore();
  const isEditMode = !!editingZone;

  const { mutateAsync: addZone, isPending: isAdding } = useAddDeliveryZone();
  const { mutateAsync: updateZone, isPending: isUpdating } =
    useUpdateDeliveryZone();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ZoneFormData>();

  // sync form on open/editingZone change
  useEffect(() => {
    if (open) {
      reset(
        editingZone
          ? {
              max_distance: String(editingZone.max_distance),
              minimum_order_amount: String(editingZone.minimum_order_amount),
              delivery_fee: String(editingZone.delivery_fee),
              delivery_time: String(editingZone.delivery_time),
            }
          : {
              max_distance: "",
              minimum_order_amount: "",
              delivery_fee: "",
              delivery_time: "",
            },
      );
    }
  }, [open, editingZone, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ZoneFormData) => {
    // In edit mode use the zone's own min_distance, in add mode use lastMaxDistance
    const min_distance = isEditMode
      ? editingZone!.min_distance
      : lastMaxDistance;

    const payload = {
      store_id: store_id!,
      min_distance,
      max_distance: parseFloat(data.max_distance),
      minimum_order_amount: parseFloat(data.minimum_order_amount),
      delivery_fee: parseFloat(data.delivery_fee),
      delivery_time: parseFloat(data.delivery_time),
      is_active: true,
    };

    try {
      if (isEditMode && editingZone) {
        await updateZone({ id: editingZone.id, payload });
        toast.success("Zone updated successfully");
      } else {
        await addZone(payload);
        toast.success("Zone added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Delivery Zone" : "Add Delivery Zone"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* ── Distance range ── */}
          {/* In Add mode: show auto min + editable max side by side */}
          {/* In Edit mode: show both min (readonly) + max (editable) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Min distance — always readonly/display only */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Min Distance
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={
                    isEditMode ? editingZone!.min_distance : lastMaxDistance
                  }
                  readOnly
                  className="pr-10 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
                  km
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {isEditMode
                  ? "Cannot be changed"
                  : "Auto-set from previous zone"}
              </p>
            </div>

            {/* Max distance — editable */}
            <FormField
              label="Max Distance"
              suffix="km"
              error={errors.max_distance?.message}
            >
              <Input
                type="number"
                placeholder="e.g. 20"
                min={
                  isEditMode
                    ? editingZone!.min_distance + 1
                    : lastMaxDistance + 1
                }
                step="0.1"
                className="pr-10"
                {...register("max_distance", {
                  required: "Required",
                  min: {
                    value: isEditMode
                      ? editingZone!.min_distance + 0.1
                      : lastMaxDistance + 0.1,
                    message: `Must be greater than ${isEditMode ? editingZone!.min_distance : lastMaxDistance} km`,
                  },
                })}
              />
            </FormField>
          </div>

          {/* Fee + Min Order */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Delivery Fee"
              suffix="€"
              error={errors.delivery_fee?.message}
            >
              <Input
                type="number"
                placeholder="5"
                min="0"
                step="0.01"
                className="pr-8"
                {...register("delivery_fee", { required: "Required" })}
              />
            </FormField>
            <FormField
              label="Min Order"
              suffix="€"
              error={errors.minimum_order_amount?.message}
            >
              <Input
                type="number"
                placeholder="20"
                min="0"
                step="0.01"
                className="pr-8"
                {...register("minimum_order_amount", { required: "Required" })}
              />
            </FormField>
          </div>

          {/* Delivery time */}
          <FormField
            label="Estimated Delivery Time"
            suffix="min"
            error={errors.delivery_time?.message}
          >
            <Input
              type="number"
              placeholder="30"
              min="1"
              className="pr-12"
              {...register("delivery_time", {
                required: "Required",
                min: { value: 1, message: "Min 1 min" },
              })}
            />
          </FormField>

          <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              ) : isEditMode ? (
                "Update Zone"
              ) : (
                "Save Zone"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DeliveryZoneForm;
