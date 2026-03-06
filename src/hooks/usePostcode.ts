// src/hooks/usePostcode.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPostcodesByStore,
  addPostcodes,
  updatePostcodes,
  deletePostcode,
} from "@/api/postcode";
import type { PostcodePayload, PostcodeUpdatePayload } from "@/api/postcode";

const POSTCODE_KEY = "postcodes";

export const useGetPostcodes = (store_id: number | string | null) =>
  useQuery({
    queryKey: [POSTCODE_KEY, store_id],
    queryFn: () => getPostcodesByStore(store_id!),
    enabled: !!store_id,
  });

export const useAddPostcode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PostcodePayload[]) => addPostcodes(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [POSTCODE_KEY] }),
  });
};

export const useUpdatePostcode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PostcodeUpdatePayload[]) => updatePostcodes(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [POSTCODE_KEY] }),
  });
};

export const useDeletePostcode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePostcode(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [POSTCODE_KEY] }),
  });
};
