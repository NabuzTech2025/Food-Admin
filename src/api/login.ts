// src/api/auth.ts
import axiosInstance from "@/api/axiosConfig";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  role_id: number;
  store_id: number;
  store_type: string;
  message?: string;
}

export const loginAdmin = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  try {
    const formData = new FormData();
    formData.append("username", payload.username);
    formData.append("password", payload.password);

    const res = await axiosInstance.post("login", formData);
    return res.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};
