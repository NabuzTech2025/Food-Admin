// src/pages/Admin/Discount.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Tag, Truck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useGetDiscounts,
  useAddDiscount,
  useUpdateDiscount,
} from "@/hooks/useDiscount";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  deliveryValue: string;
  pickupValue: string;
  expiresAt: string;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function DiscountPage() {
  const { store_id } = useAdminStore();

  const { data: discountsRaw, isLoading } = useGetDiscounts(store_id);
  const { mutateAsync: addItem, isPending: isAdding } = useAddDiscount();
  const { mutateAsync: updateItem, isPending: isUpdating } =
    useUpdateDiscount();
  const isSaving = isAdding || isUpdating;

  const discounts = Array.isArray(discountsRaw) ? discountsRaw : [];
  const deliveryDiscount = discounts.find(
    (d) => d.code === "DELIVERY_DISCOUNT",
  );
  const pickupDiscount = discounts.find((d) => d.code === "PICKUP_DISCOUNT");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  // ── Pre-fill form with existing data ──
  useEffect(() => {
    if (discounts.length > 0) {
      reset({
        deliveryValue: String(deliveryDiscount?.value ?? ""),
        pickupValue: String(pickupDiscount?.value ?? ""),
        expiresAt:
          deliveryDiscount?.expires_at?.split("T")[0] ||
          pickupDiscount?.expires_at?.split("T")[0] ||
          "",
      });
    }
  }, [discountsRaw]);

  const onSubmit = async (data: FormData) => {
    const expiryDate = new Date(data.expiresAt).toISOString();

    const deliveryPayload = {
      code: "DELIVERY_DISCOUNT",
      type: "percentage",
      value: parseFloat(data.deliveryValue),
      expires_at: expiryDate,
      store_id: Number(store_id),
    };

    const pickupPayload = {
      code: "PICKUP_DISCOUNT",
      type: "percentage",
      value: parseFloat(data.pickupValue),
      expires_at: expiryDate,
      store_id: Number(store_id),
    };

    try {
      await Promise.all([
        deliveryDiscount
          ? updateItem({ id: deliveryDiscount.id, payload: deliveryPayload })
          : addItem(deliveryPayload),
        pickupDiscount
          ? updateItem({ id: pickupDiscount.id, payload: pickupPayload })
          : addItem(pickupPayload),
      ]);
      toast.success("Discounts saved successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save discounts");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Form ── */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-neutral-800">
                Set Discount Percentages
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6 space-y-5">
              {/* Delivery Discount */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Truck size={15} className="text-primary" />
                  Delivery Discount (%)
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  step={1}
                  {...register("deliveryValue", {
                    required: "Delivery discount is required",
                    min: { value: 0, message: "Min value is 0" },
                    max: { value: 100, message: "Max value is 100" },
                  })}
                />
                <FieldError message={errors.deliveryValue?.message} />
              </div>

              {/* Pickup Discount */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-primary" />
                  Pickup Discount (%)
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  step={1}
                  {...register("pickupValue", {
                    required: "Pickup discount is required",
                    min: { value: 0, message: "Min value is 0" },
                    max: { value: 100, message: "Max value is 100" },
                  })}
                />
                <FieldError message={errors.pickupValue?.message} />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Expiry Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("expiresAt", {
                    required: "Expiry date is required",
                  })}
                />
                <FieldError message={errors.expiresAt?.message} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-muted/30 rounded-b-xl">
              <Button
                type="submit"
                disabled={isSaving || isLoading}
                className="w-full h-10"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Saving...
                  </>
                ) : (
                  "Save Discounts"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right: Current Discounts ── */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-neutral-800">
                Current Discounts
              </h2>
            </div>
          </div>

          <div className="px-6 py-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : discounts.filter(
                (d) =>
                  d.code === "DELIVERY_DISCOUNT" ||
                  d.code === "PICKUP_DISCOUNT",
              ).length > 0 ? (
              <div className="space-y-3">
                {discounts
                  .filter(
                    (d) =>
                      d.code === "DELIVERY_DISCOUNT" ||
                      d.code === "PICKUP_DISCOUNT",
                  )
                  .map((discount) => (
                    <div
                      key={discount.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {discount.code === "DELIVERY_DISCOUNT" ? (
                            <Truck size={18} className="text-primary" />
                          ) : (
                            <ShoppingBag size={18} className="text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            {discount.code === "DELIVERY_DISCOUNT"
                              ? "Delivery"
                              : "Pickup"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Expires:{" "}
                            {discount.expires_at
                              ? new Date(
                                  discount.expires_at,
                                ).toLocaleDateString("en-GB")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          {discount.value}%
                        </span>
                        <p className="text-xs text-neutral-500">discount</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-400">
                <Tag size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No discounts set yet.</p>
                <p className="text-xs mt-1">Fill the form to add discounts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscountPage;
