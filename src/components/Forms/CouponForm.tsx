import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddCoupon, useUpdateCoupon } from "@/hooks/useCoupon";
import type { Coupon, CouponPayload } from "@/api/coupon";

interface CouponFormData {
  code: string;
  name: string;
  coupon_type: string;
  value: string;
  min_cart_amount: string;
  max_discount_amount: string;
  start_at: string;
  end_at: string;
  usage_limit: string;
  usage_per_user: string;
  is_active: string;
}

interface CouponFormProps {
  open: boolean;
  onClose: () => void;
  editData?: Coupon | null;
}

const DEFAULT_VALUES: CouponFormData = {
  code: "",
  name: "",
  coupon_type: "percent",
  value: "",
  min_cart_amount: "",
  max_discount_amount: "",
  start_at: "",
  end_at: "",
  usage_limit: "",
  usage_per_user: "",
  is_active: "true",
};

const SELECT_CLS =
  "w-full h-10 px-3 text-sm rounded-md border border-input bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

const FormLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-sm font-medium">
    {children}
    {required && <span className="text-destructive ml-0.5">*</span>}
  </label>
);

function CouponForm({ open, onClose, editData }: CouponFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addCoupon, isPending: isAdding } = useAddCoupon();
  const { mutateAsync: updateCoupon, isPending: isUpdating } = useUpdateCoupon();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const selectedType = watch("coupon_type");

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? {
              code: editData.code,
              name: editData.name || "",
              coupon_type: editData.coupon_type || "percent",
              value: editData.value ? String(editData.value) : "",
              min_cart_amount: editData.min_cart_amount
                ? String(editData.min_cart_amount)
                : "",
              max_discount_amount: editData.max_discount_amount
                ? String(editData.max_discount_amount)
                : "",
              start_at: editData.start_at ? editData.start_at.split("T")[0] : "",
              end_at: editData.end_at ? editData.end_at.split("T")[0] : "",
              usage_limit: editData.usage_limit ? String(editData.usage_limit) : "",
              usage_per_user: editData.usage_per_user ? String(editData.usage_per_user) : "",
              is_active: String(editData.is_active ?? true),
            }
          : DEFAULT_VALUES
      );
    }
  }, [editData, open, reset]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (data: CouponFormData) => {
    const payload: CouponPayload = {
      store_id: Number(store_id),
      code: data.code.trim(),
      name: data.name.trim(),
      coupon_type: data.coupon_type,
      value: data.value ? parseFloat(data.value) : null,
      min_cart_amount: data.min_cart_amount ? parseFloat(data.min_cart_amount) : null,
      max_discount_amount: data.max_discount_amount ? parseFloat(data.max_discount_amount) : null,
      start_at: data.start_at ? new Date(data.start_at).toISOString() : null,
      end_at: data.end_at ? new Date(data.end_at).toISOString() : null,
      usage_limit: data.usage_limit ? parseInt(data.usage_limit) : null,
      usage_per_user: data.usage_per_user ? parseInt(data.usage_per_user) : null,
      is_active: data.is_active === "true",
    };

    try {
      if (isEditMode && editData) {
        await updateCoupon({ id: editData.id, payload });
        toast.success("Coupon updated successfully");
      } else {
        await addCoupon(payload);
        toast.success("Coupon added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const isFreeDelivery = selectedType === "free_delivery";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] p-0 flex flex-col gap-0 rounded-xl overflow-hidden bg-background border shadow-lg">
        {/* HEADER */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit Coupon" : "Add New Coupon"}
          </DialogTitle>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form id="coupon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel required>Coupon Code</FormLabel>
                <Input
                  placeholder="e.g. SAVE10"
                  className="uppercase"
                  {...register("code", { required: "Code is required" })}
                />
                <FieldError message={errors.code?.message} />
              </div>

              <div className="space-y-1.5">
                <FormLabel required>Coupon Name</FormLabel>
                <Input
                  placeholder="e.g. 10% Off Entire Cart"
                  {...register("name", { required: "Name is required" })}
                />
                <FieldError message={errors.name?.message} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Type</FormLabel>
                <select className={SELECT_CLS} {...register("coupon_type")}>
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="cart_threshold">Cart Threshold</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <FormLabel>Value / Discount amount</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={isFreeDelivery ? "Optional" : "e.g. 10"}
                  disabled={isFreeDelivery && false} // Allowed by payload
                  {...register("value")}
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Status</FormLabel>
                <select className={SELECT_CLS} {...register("is_active")}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Row 3 Limit/Cart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Min Cart Amount</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 50"
                  {...register("min_cart_amount")}
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Max Discount Amount</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 15"
                  {...register("max_discount_amount")}
                />
              </div>
            </div>

            {/* Row 4 Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Valid From (Optional)</FormLabel>
                <Input
                  type="date"
                  {...register("start_at")}
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Valid Until (Optional)</FormLabel>
                <Input
                  type="date"
                  {...register("end_at")}
                />
              </div>
            </div>

            {/* Row 5 Usages limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Total Usage Limit</FormLabel>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  {...register("usage_limit")}
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Usage limit per user</FormLabel>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  {...register("usage_per_user")}
                />
              </div>
            </div>
            
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 px-6 py-4 border-t bg-background">
          <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-1" size={16} />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : isEditMode ? (
              "Update Coupon"
            ) : (
              "Save Coupon"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CouponForm;
