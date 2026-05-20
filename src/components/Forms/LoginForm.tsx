import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import type { LoginFormData } from "@/types/Admin.types";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { setSessionStorage } from "@/utils/storage";
import { useAdminStore } from "@/context/store/useAdminStore";
import type { AxiosError } from "axios";

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

  const onSubmit = (data: LoginFormData) => {
    mutateAsync(data, {
      onSuccess: (result) => {
        const adminData = {
          token: result.access_token,
          role_id: result.role_id,
          store_id: result.store_id,
          store_type: result.store_type,
        };
        setSessionStorage({ key: "AdminData", data: adminData });
        setAdminData(adminData);
        toast.success(result.message || "Login successful");
        if (result.role_id === 1) {
          navigate("/super/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      },
      onError: (error) => {
        const axiosError = error as AxiosError<{
          detail?: string;
          message?: string;
        }>;
        const errMsg =
          axiosError?.response?.data?.detail ||
          axiosError?.response?.data?.message ||
          "Login failed";
        toast.error(errMsg);
      },
    });
  };
  return (
    <div className="w-full max-w-md mx-auto space-y-6 shadow-lg p-8 rounded-lg bg-card border border-border z-20">
      <div className="flex flex-col items-center">
        <img src="/v1/admin/super-admin-logo.png" className="w-52" />
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
