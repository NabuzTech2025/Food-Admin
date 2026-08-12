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
import { currentLanguage } from "@/utils/helper/Lang-Trancelate";

interface FormData {
  deliveryValue: string;
  pickupValue: string;
  expiresAt: string;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

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
      toast.success(currentLanguage.save_discounts);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save discounts");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Page Title ── */}
      <h2 className="text-2xl font-bold text-neutral-800">
        {currentLanguage.discount_management}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Left: Form ── */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-neutral-800">
              {currentLanguage.set_discount_percentages}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6 space-y-5">
              {/* Delivery Discount */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Truck size={15} className="text-primary" />
                  {currentLanguage.delivery_discount_percentage}
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  step={1}
                  {...register("deliveryValue", {
                    required: currentLanguage.form_fill_message,
                    min: { value: 0, message: "Min 0" },
                    max: { value: 100, message: "Max 100" },
                  })}
                />
                <FieldError message={errors.deliveryValue?.message} />
              </div>

              {/* Pickup Discount */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-primary" />
                  {currentLanguage.pickup_discount_percentage}
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  step={1}
                  {...register("pickupValue", {
                    required: currentLanguage.form_fill_message,
                    min: { value: 0, message: "Min 0" },
                    max: { value: 100, message: "Max 100" },
                  })}
                />
                <FieldError message={errors.pickupValue?.message} />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  {currentLanguage.expiry_date}
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("expiresAt", {
                    required: currentLanguage.form_fill_message,
                  })}
                />
                <FieldError message={errors.expiresAt?.message} />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-muted/30 rounded-b-xl">
              <Button
                type="submit"
                disabled={isSaving || isLoading}
                className="w-full h-10"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    {currentLanguage.saving}
                  </>
                ) : (
                  currentLanguage.save_discounts
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right: Current Discounts ── */}
        <div className="bg-white rounded-xl border border-border shadow-sm h-fit">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-neutral-800">
              {currentLanguage.current_discounts}
            </h2>
          </div>

          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-sm text-neutral-500">
                  {currentLanguage.loading_discounts}
                </p>
              </div>
            ) : discounts.filter(
              (d) =>
                d.code === "DELIVERY_DISCOUNT" ||
                d.code === "PICKUP_DISCOUNT",
            ).length > 0 ? (
              <div>
                {/* ✅ Table header — properly aligned */}
                <div className="grid grid-cols-2 px-4 py-2 mb-1">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    {currentLanguage.type}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest text-right">
                    {currentLanguage.value}
                  </span>
                </div>

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
                        className="grid grid-cols-2 items-center p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        {/* Left: icon + name — ✅ English mein */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {discount.code === "DELIVERY_DISCOUNT" ? (
                              <Truck size={16} className="text-primary" />
                            ) : (
                              <ShoppingBag size={16} className="text-primary" />
                            )}
                          </div>
                          <div>
                            {/* ✅ English names */}
                            <p className="text-sm font-semibold text-neutral-800">
                              {discount.code === "DELIVERY_DISCOUNT"
                                ? "Delivery"
                                : "Pickup"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {discount.expires_at
                                ? new Date(
                                  discount.expires_at,
                                ).toLocaleDateString("de-DE")
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Right: value — right-aligned, properly vertically aligned */}
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className="text-2xl font-bold text-primary">
                            {discount.value}%
                          </span>
                          <span className="text-sm font-medium text-neutral-500">
                            {currentLanguage.discount}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-400">
                <Tag size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{currentLanguage.loading_discounts}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscountPage;
