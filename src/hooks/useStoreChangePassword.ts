import { changeStorePassword } from "@/api/storeChangePassword";
import { useMutation } from "@tanstack/react-query";

export const useStoreChangePassword = () => {
  return useMutation({
    mutationFn: ({
      storeId,
      newPassword,
    }: {
      storeId: number | string;
      newPassword: string;
    }) => changeStorePassword(storeId, newPassword),
  });
};
