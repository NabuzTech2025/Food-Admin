// src/hooks/useDeviceStatus.ts
import { useQuery } from "@tanstack/react-query";
import { getAllDevicesStatus, getStoreDeviceStatus, getWindowsDeviceStatus } from "@/api/deviceStatus";

const DEVICE_KEY = "device-status";

// role_id === 1 → all devices
export const useGetAllDevicesStatus = (enabled: boolean) =>
  useQuery({
    queryKey: [DEVICE_KEY, "all"],
    queryFn: () => getAllDevicesStatus(),
    enabled,
    refetchInterval: 30000,
  });

// role_id === 2 → store specific device
export const useGetStoreDeviceStatus = (
  store_id: number | string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [DEVICE_KEY, store_id],
    queryFn: () => getStoreDeviceStatus(store_id!),
    enabled: !!store_id && enabled,
    refetchInterval: 30000,
  });

export const useGetWindowsDeviceStatus = (enabled: boolean) =>
  useQuery({
    queryKey: [DEVICE_KEY, "windows"],
    queryFn: () => getWindowsDeviceStatus(),
    enabled,
    refetchInterval: 30000,
  });
