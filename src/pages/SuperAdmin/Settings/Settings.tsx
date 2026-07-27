import { useEffect, useState } from "react";
import { Loader2, MapPin, KeyRound, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetStore, useUpdateStore } from "@/hooks/useStore";
import { useStoreChangePassword } from "@/hooks/useStoreChangePassword";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import StoreSetting from "@/pages/StoreSetting";

interface PasswordForm {
  newPassword: string;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

function Settings() {
  const { storeId } = useParams();
  const store_id = Number(storeId);

  const { data, isLoading } = useGetStore(store_id);
  const { mutate: updateStore, isPending } = useUpdateStore();
  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useStoreChangePassword();

  const [useDistanceDelivery, setUseDistanceDelivery] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({ mode: "onBlur" });

  useEffect(() => {
    if (data) {
      setUseDistanceDelivery(data.use_distance_delivery ?? false);
    }
  }, [data]);

  const toggle = () => {
    if (!store_id || isPending) return;

    const newValue = !useDistanceDelivery;
    setUseDistanceDelivery(newValue);

    updateStore(
      { id: store_id, payload: { use_distance_delivery: newValue } },
      {
        onSuccess: () => toast.success("Settings updated"),
        onError: (err: any) => {
          setUseDistanceDelivery(!newValue);
          toast.error(
            err?.response?.data?.message || "Failed to update settings",
          );
        },
      },
    );
  };

  const onPasswordSubmit = async (formData: PasswordForm) => {
    try {
      await changePassword({
        storeId: store_id,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="space-y-4">
      <StoreSetting storeId={store_id} roleId={1} />

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            General Settings
          </h2>
          {isPending && (
            <Loader2 size={18} className="animate-spin text-primary" />
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <MapPin size={22} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    Distance-based Delivery
                  </p>
                  <p className="text-xs text-neutral-500">
                    Calculate delivery fees based on customer distance from the
                    store
                  </p>
                </div>
              </div>
              <Switch
                checked={useDistanceDelivery}
                onCheckedChange={toggle}
                className="cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Enable distance-based delivery to charge customers according to how
            far they are from the store.
          </p>
        </div>
      </div>

      {/* ── Change Password ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <KeyRound size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-800">
              Change Password
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Update the store account password
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onPasswordSubmit)}>
          <div className="px-5 py-6 max-w-md">
            {/* New Password — single field only */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">
                New Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pr-10"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.newPassword?.message} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t bg-muted/30 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-40 cursor-pointer"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="animate-spin mr-1" size={16} />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
