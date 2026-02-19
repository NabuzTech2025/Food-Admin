// src/hooks/Common/useGetCurrentUser.ts

import { getCurrentUser } from "@/utils/apis";
import { getCurrentUserToken } from "@/utils/storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Types matching backend response
export interface EducatorProfile {
  id: number;
  userId: number;
  username: string | null;
  name: string | null;
  phoneNumber: string | null;
  jobRole: string | null;
  isSubscribed: boolean;
  clinicalExperience: string | null;
}

export interface IndividualProfile {
  id: number;
  userId: number;
  username: string | null;
  name: string | null;
  educatorId: number | null;
  educatorName: string | null;
}

export interface EducatorUserData {
  id: number;
  email: string;
  userType: "EDUCATOR";
  isVerified: boolean;
  createdAt: string;
  profile: EducatorProfile;
}

export interface IndividualUserData {
  id: number;
  email: string;
  userType: "INDIVIDUAL";
  isVerified: boolean;
  createdAt: string;
  profile: IndividualProfile;
}

export type CurrentUserData = EducatorUserData | IndividualUserData;

const useGetCurrentUser = () => {
  const token = getCurrentUserToken();
  const queryClient = useQueryClient();

  const query = useQuery<CurrentUserData, Error>({
    queryKey: ["current-user", token], // Token in key prevents stale data
    queryFn: async () => {
      console.log("Fetching user with token:", token);

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(getCurrentUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User data fetched:", response.data);

      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      return response.data;
    },
    enabled: !!token, // Only run if token exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount
    retry: 1,
  });

  // Computed values for convenience
  const isAuthenticated = !!query.data;
  const isEducator = query.data?.userType === "EDUCATOR";
  const isIndividual = query.data?.userType === "INDIVIDUAL";

  // Clear user function
  const clearUser = () => {
    console.log("Clearing user data from cache");

    // Cancel any pending queries
    queryClient.cancelQueries({ queryKey: ["current-user"] });

    // Set data to null immediately
    queryClient.setQueryData(["current-user"], null);

    // Remove all variations of the query
    queryClient.removeQueries({
      queryKey: ["current-user"],
      exact: false,
    });

    // Invalidate to prevent stale data
    queryClient.invalidateQueries({
      queryKey: ["current-user"],
    });
  };

  return {
    user: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isAuthenticated,
    isEducator,
    isIndividual,
    refetch: query.refetch,
    clearUser,
  };
};

export default useGetCurrentUser;
