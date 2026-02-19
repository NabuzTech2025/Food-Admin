import { changePassword } from "@/utils/apis";
import { getCurrentUserToken } from "@/utils/storage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { toast } from "sonner";

function useChnagePassword(handleClose: () => void) {
  const token = getCurrentUserToken();
  return useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => {
      const response = await axios.put(
        changePassword,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Password changed successfully");
        handleClose();
      } else {
        toast.error(
          data.message || "Failed to change password. Please try again.",
        );
      }
    },
    onError: (err: any) => {
      const msg =
        err?.message || "Failed to change password. Please try again.";
      toast.error(msg);
    },
  });
}

export default useChnagePassword;
