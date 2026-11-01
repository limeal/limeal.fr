"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Project, { ProjectDetails } from "@/interfaces/project";
import AssistantProfile from "@/interfaces/assistantProfile";
import {
  deleteProject,
  getAssistantNotes,
  getProjects,
  saveProject,
  setAssistantNotes,
} from "@/firebase/store/project";
import { byMostRecent } from "@/utils/project";
import { queryKeys } from "./keys";

// Public projects, completed with their private details when a vault code is known.
// The previous list stays on screen while the details load.
export const useProjects = (vaultCode: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.projects(vaultCode),
    queryFn: async () => (await getProjects(vaultCode)).sort(byMostRecent),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useSaveProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ project, details, vaultCode }: { project: Project; details: ProjectDetails | null; vaultCode: string | null }) =>
      saveProject(project, details, vaultCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ project, vaultCode }: { project: Project; vaultCode: string | null }) =>
      deleteProject(project, vaultCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useAssistantNotes = (vaultCode: string) =>
  useQuery({ queryKey: queryKeys.assistantNotes(vaultCode), queryFn: () => getAssistantNotes(vaultCode) });

export const useSaveAssistantNotes = (vaultCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: AssistantProfile) => setAssistantNotes(vaultCode, profile),
    onSuccess: (_, profile) => queryClient.setQueryData(queryKeys.assistantNotes(vaultCode), profile),
  });
};
