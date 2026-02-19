import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import type { LoginFormData } from "@/types/Admin.types";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { setLocalStorage } from "@/utils/storage";
import { useAdminStore } from "@/context/store/useAdminStore";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: "onBlur",
  });
  const { mutateAsync, isPending } = useAdminLogin();
  const navigate = useNavigate();
  const setAdminData = useAdminStore((state) => state.setAdminData);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await mutateAsync(data);

      const adminData = {
        token: result.access_token,
        role_id: result.role_id,
        store_id: result.store_id,
        store_type: result.store_type,
      };

      // Save to localStorage
      setLocalStorage({ key: "AdminData", data: adminData });

      // Save to Zustand store
      setAdminData(adminData);
      toast.success(result.message || "Login successful");
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 shadow-lg p-8 rounded-lg bg-card border border-border z-20">
      <div className="flex flex-col items-center mb-10">
        <img src="/brand.svg" className="w-52" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
        <div className="space-y-2">
          <label htmlFor="identifier" className="text-sm font-medium">
            Email Address or Username
          </label>
          <Input
            id="email"
            type="text"
            placeholder="Test@gmail.com or username"
            aria-invalid={errors.identifier ? "true" : "false"}
            {...register("identifier", {
              required: "Email or username is required",
              validate: (value) => {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const isUsername = /^[a-zA-Z0-9_]{3,}$/.test(value);
                return (
                  isEmail ||
                  isUsername ||
                  "Enter a valid email or username (min 3 characters, letters/numbers/underscores)"
                );
              },
            })}
          />
          {errors.identifier && (
            <p className="text-sm text-destructive">
              {errors.identifier.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button className="w-full bg-primary">
          {isPending || isSubmitting ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
      </form>
      <Toaster />
    </div>
  );
}

export default LoginForm;
