import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "@/hooks/useChangePassword";

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

function ChangePasswordPage() {
  const { mutateAsync, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Change Password
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Update your account password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-5 py-6 space-y-6 max-w-md">
            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-base font-semibold text-neutral-700">
                Current Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={"password"}
                  placeholder="Enter current password"
                  className="pr-10"
                  {...register("oldPassword", {
                    required: "Current password is required",
                  })}
                />
              </div>
              <FieldError message={errors.oldPassword?.message} />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-base font-semibold text-neutral-700">
                New Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={"password"}
                  placeholder="Enter new password"
                  className="pr-10"
                  {...register("newPassword", {
                    required: "New password is required",
                  })}
                />
              </div>
              <FieldError message={errors.newPassword?.message} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t bg-muted/30 rounded-b-xl">
            <Button
              type="submit"
              disabled={isPending}
              className="w-40 h-10 cursor-pointer"
            >
              {isPending ? (
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

export default ChangePasswordPage;
