// src/api/deviceStatus.ts
import axiosInstance from "@/api/axiosConfig";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DeviceDetail {
  store_id: number;
  store_name: string;
  username: string;
  last_heartbeat: string;
  seconds_since_heartbeat: number;
  is_alive: boolean;
  is_connected: boolean;
  websocket_connected: boolean;
}

// role_id === 1 — super admin: all stores
export interface DeviceStatusSummary {
  alive: DeviceDetail[];
  stale: DeviceDetail[];
  summary: {
    total: number;
    alive: number;
    stale: number;
  };
}

export interface WindowsDeviceDetail {
  store_id: number;
  store_name: string;
  online: boolean;
  since: string | null;
}

export interface WindowsDeviceStatusResponse {
  summary: {
    total: number;
    online: number;
    offline: number;
  };
  online: WindowsDeviceDetail[];
  offline: WindowsDeviceDetail[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

// role_id === 1 → GET /devices/status
export const getAllDevicesStatus = async (): Promise<DeviceStatusSummary> => {
  try {
    const res = await axiosInstance.get("/devices/status");
    return res.data;
  } catch (error) {
    console.error("Get All Devices Status Error:", error);
    throw error;
  }
};

export const getWindowsDeviceStatus = async (): Promise<WindowsDeviceStatusResponse> => {
  try {
    const res = await axiosInstance.get("/stores/online/windows/all");
    return res.data;
  } catch (error) {
    console.error("Get Windows Device Status Error:", error);
    throw error;
  }
};

// role_id === 2 → GET /devices/store/${store_id}
export const getStoreDeviceStatus = async (
  store_id: number | string,
): Promise<DeviceDetail> => {
  try {
    const res = await axiosInstance.get(`/devices/store/${store_id}`);
    return res.data;
  } catch (error) {
    console.error("Get Store Device Status Error:", error);
    throw error;
  }
};
