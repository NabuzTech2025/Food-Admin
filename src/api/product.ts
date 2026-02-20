import axiosInstance from "@/api/axiosConfig";

export interface Variant {
  id?: number;
  name: string;
  price: number;
  discount_price: number;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  item_code: string;
  description: string;
  image_url: string;
  display_order: number | null;
  isActive: boolean;
  type: "simple" | "variable";
  price: number;
  discount_price: number;
  store_id: number;
  category_id: number;
  category?: { id: number; name: string };
  tax_id: number | null;
  tax?: { id: number; name: string; percentage: number };
  variants?: Variant[];
}

export interface ProductPayload {
  name: string;
  item_code: string;
  description: string;
  image_url: string;
  display_order: number | null;
  isActive: boolean;
  type: "simple" | "variable";
  price: number;
  discount_price: number;
  store_id: number | string;
  category_id: number | string;
  tax_id: number | string | null;
  variants: Omit<Variant, "id">[];
}

export const getProduct = async (store_id: number | string): Promise<Product[]> => {
  try {
    const res = await axiosInstance.get(`products/`, { params: { store_id } });
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (error) {
    console.error("Get Product Error:", error);
    throw error;
  }
};

export const addProduct = async (payload: ProductPayload): Promise<Product> => {
  try {
    const res = await axiosInstance.post(`products/`, payload);
    return res.data;
  } catch (error) {
    console.error("Add Product Error:", error);
    throw error;
  }
};

export const updateProduct = async (id: number, payload: ProductPayload): Promise<Product> => {
  try {
    const res = await axiosInstance.put(`products/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Product Error:", error);
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`products/${id}`);
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error;
  }
};