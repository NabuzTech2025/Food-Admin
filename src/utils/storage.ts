// src/utils/storage.ts
import type { AdminStorageData } from "@/types/Admin.types";

interface StorageSchema {
  AdminData: AdminStorageData;
}

type StorageKey = keyof StorageSchema;

// ─── Local Storage ───────────────────────────────────────────────────────────

export const setLocalStorage = <K extends StorageKey>({
  key,
  data,
}: {
  key: K;
  data: StorageSchema[K];
}) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getLocalStorage = <K extends StorageKey>(
  key: K,
): StorageSchema[K] | null => {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as StorageSchema[K];
  }
  return null;
};

export const getAdminToken = (): string | null => {
  const data = getLocalStorage("AdminData");
  return data?.token ?? null;
};

export const removeLocalStorage = (key: StorageKey) => {
  localStorage.removeItem(key);
};

export const clearLocalStorage = () => {
  localStorage.clear();
};

// ─── Session Storage ─────────────────────────────────────────────────────────

export const setSessionStorage = <K extends StorageKey>({
  key,
  data,
}: {
  key: K;
  data: StorageSchema[K];
}) => {
  sessionStorage.setItem(key, JSON.stringify(data));
};

export const getSessionStorage = <K extends StorageKey>(
  key: K,
): StorageSchema[K] | null => {
  const data = sessionStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as StorageSchema[K];
  }
  return null;
};

export const getSessionAdminToken = (): string | null => {
  const data = getSessionStorage("AdminData");
  return data?.token ?? null;
};

export const removeSessionStorage = (key: StorageKey) => {
  sessionStorage.removeItem(key);
};

export const clearSessionStorage = () => {
  sessionStorage.clear();
};

// ─── Generic token getter (checks localStorage) ───────────────────────────────

export const getuserAccessToken = ({ tokenName }: { tokenName: string }) => {
  return sessionStorage.getItem(tokenName);
};

export const getCurrentUserToken = () => {
  return getuserAccessToken({ tokenName: "AdminData" });
};
