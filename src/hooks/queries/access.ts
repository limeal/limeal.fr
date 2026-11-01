"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "firebase/auth";

import {
  AccessSettings,
  AccessStatus,
  getAccessEvents,
  getAccessRequests,
  getAccessSettings,
  getMyRequest,
  getTraffic,
  setAccessSettings,
  setRequestStatus,
} from "@/firebase/store/access";
import { ensureVaultMarker, getVaultCode } from "@/firebase/store/project";
import { queryKeys } from "./keys";

// The signed-in visitor's access request (null: they never asked)
export const useMyAccessRequest = (user: User | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.accessRequest(user?.uid ?? ""),
    queryFn: () => getMyRequest(user as User),
    enabled: enabled && !!user,
  });

// Rules let the admin and approved recruiters read it
export const useVaultCode = (scope: "admin" | "recruiter", uid: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.vaultCode(scope, uid ?? ""),
    queryFn: async () => {
      const code = await getVaultCode();
      // Older private spaces predate the marker document
      if (code && scope === "admin") await ensureVaultMarker(code).catch(() => undefined);
      return code;
    },
    enabled: enabled && !!uid,
    staleTime: Infinity,
  });

export const useAccessSettings = (enabled = true) =>
  useQuery({ queryKey: queryKeys.accessSettings, queryFn: getAccessSettings, enabled });

export const useSaveAccessSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: AccessSettings) => setAccessSettings(settings),
    onSuccess: (_, settings) => queryClient.setQueryData(queryKeys.accessSettings, settings),
  });
};

// --- Admin ---

export const useAccessRequests = () =>
  useQuery({ queryKey: queryKeys.accessRequests, queryFn: getAccessRequests });

export const useSetRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, status }: { uid: string; status: AccessStatus }) => setRequestStatus(uid, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accessRequests }),
  });
};

export const useAccessEvents = (uid: string, enabled: boolean) =>
  useQuery({ queryKey: queryKeys.accessEvents(uid), queryFn: () => getAccessEvents(uid), enabled });

export const useTraffic = (days: number) =>
  useQuery({ queryKey: queryKeys.traffic(days), queryFn: () => getTraffic(days) });
