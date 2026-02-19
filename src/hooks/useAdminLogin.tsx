// src/hooks/useAdminLogin.ts
import { loginAdmin } from "@/api/login";
import type { LoginFormData } from "@/types/Admin.types";
import { useMutation } from "@tanstack/react-query";

function useAdminLogin() {
  return useMutation({
    mutationFn: ({ identifier, password }: LoginFormData) =>
      loginAdmin({ username: identifier, password }),
  });
}

export { useAdminLogin };
