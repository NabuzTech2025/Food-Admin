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
    // Build payload according to the API requirements for different coupon_type
    const payload: any = {
      store_id: Number(store_id),
      code: data.code.trim(),
      name: data.name.trim(),
      coupon_type: data.coupon_type,
    };

    if (data.coupon_type === "percent") {
      payload.value = parseFloat(data.value) || 0;
      if (data.min_cart_amount) payload.min_cart_amount = parseFloat(data.min_cart_amount);
      if (data.max_discount_amount) payload.max_discount_amount = parseFloat(data.max_discount_amount);
    } else if (data.coupon_type === "fixed") {
      payload.value = parseFloat(data.value) || 0;
    } else if (data.coupon_type === "cart_threshold") {
      payload.value = parseFloat(data.value) || 0;
      if (data.min_cart_amount) payload.min_cart_amount = parseFloat(data.min_cart_amount);
    } else if (data.coupon_type === "free_delivery") {
      if (data.min_cart_amount) payload.min_cart_amount = parseFloat(data.min_cart_amount);
    }

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
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] max-h-[90vh] p-0 flex flex-col gap-0 rounded-xl overflow-hidden bg-background border shadow-lg">
        {/* HEADER */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit Offer Coupon" : "Add Offer Coupon"}
          </DialogTitle>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form id="coupon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-1.5">
              <FormLabel required>Coupon Type</FormLabel>
              <select className={SELECT_CLS} {...register("coupon_type")}>
                <option value="percent">-- select coupon type --</option>
                <option value="fixed">Fixed Amount</option>
                <option value="cart_threshold">Cart Threshold</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <FormLabel required>Coupon Name</FormLabel>
              <Input
                placeholder="Add Title..."
                {...register("name", { required: "Name is required" })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel required>Add Code</FormLabel>
              <Input
                placeholder="Add Code"
                className="uppercase focus-visible:ring-primary"
                {...register("code", { required: "Code is required" })}
              />
              <FieldError message={errors.code?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Coupon Value</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={selectedType === "free_delivery" ? "N/A for Free Delivery" : ""}
                disabled={selectedType === "free_delivery"}
                {...register("value")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel required>Min. Order Amt.</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={selectedType === "fixed" ? "N/A for Fixed" : ""}
                  disabled={selectedType === "fixed"}
                  {...register("min_cart_amount")}
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Max. Discount Amt.</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={selectedType !== "percent" ? "N/A" : ""}
                  disabled={selectedType !== "percent"}
                  {...register("max_discount_amount")}
                />
              </div>
            </div>
            
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 px-6 py-4 border-t bg-background">
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
            form="coupon-form" 
            disabled={isLoading} 
            className="w-full sm:w-auto"
          >
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
