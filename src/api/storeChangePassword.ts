import axiosInstance from "./axiosConfig";

export const changeStorePassword = async (
  storeId: number | string,
  newPassword: string,
): Promise<void> => {
  await axiosInstance.post(`superadmin/stores/${storeId}/reset-owner-password`, {
    new_password: newPassword,
  });
};
