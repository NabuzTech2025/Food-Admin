import axiosInstance from "./axiosConfig";

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    await axiosInstance.post("me/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    throw error;
  }
};
