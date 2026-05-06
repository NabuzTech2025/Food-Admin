import { changePassword } from "@/api/chnage_passwd";
import { useMutation } from "@tanstack/react-query";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => changePassword(oldPassword, newPassword),
  });
};
