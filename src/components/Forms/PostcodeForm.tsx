// src/components/Forms/PostcodeForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddPostcode, useUpdatePostcode } from "@/hooks/usePostcode";
import type { Postcode } from "@/api/postcode";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  postcode: string;
  minimum_order_amount: string;
  delivery_fee: string;
  delivery_time: string;
}

interface PostcodeFormProps {
  open: boolean;
  onClose: () => void;
  editData?: Postcode | null;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function PostcodeForm({ open, onClose, editData }: PostcodeFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addItem, isPending: isAdding } = useAddPostcode();
  const { mutateAsync: updateItem, isPending: isUpdating } =
    useUpdatePostcode();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          postcode: editData.postcode,
          minimum_order_amount: String(editData.minimum_order_amount),
          delivery_fee: String(editData.delivery_fee),
          delivery_time: String(editData.delivery_time),
        });
      } else {
        reset({
          postcode: "",
          minimum_order_amount: "",
          delivery_fee: "",
          delivery_time: "",
        });
      }
    }
  }, [open, editData]);

  const handleClose = () => {
    reset({
      postcode: "",
      minimum_order_amount: "",
      delivery_fee: "",
      delivery_time: "",
    });
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode) {
        await updateItem([
          {
            id: editData!.id,
            postcode: data.postcode,
            minimum_order_amount: parseFloat(data.minimum_order_amount),
            delivery_fee: parseFloat(data.delivery_fee),
            delivery_time: parseInt(data.delivery_time),
          },
        ]);
        toast.success("Postcode updated successfully");
      } else {
        await addItem([
          {
            postcode: data.postcode,
            minimum_order_amount: parseFloat(data.minimum_order_amount),
            delivery_fee: parseFloat(data.delivery_fee),
            delivery_time: parseInt(data.delivery_time),
            store_id: store_id!,
          },
        ]);
        toast.success("Postcode added successfully");
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
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit Postcode" : "Add Postcode"}
          </DialogTitle>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            {/* Postcode */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">
                Postcode <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. 10115"
                {...register("postcode", { required: "Postcode is required" })}
              />
              <FieldError message={errors.postcode?.message} />
            </div>

            {/* Min Order + Delivery Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Min Order Amount <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
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
                  placeholder="0.00"
                  step="0.01"
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
                "Save Postcode"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PostcodeForm;
