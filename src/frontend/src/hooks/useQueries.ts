import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Campaign,
  SocialPost,
  StudentLead,
  Task,
  UserProfile,
} from "../backend";
import { LeadStage, UserRole } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCountActiveLeads() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["countActiveLeads"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.countActiveLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllLeads(isAdmin: boolean) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<StudentLead[]>({
    queryKey: ["leads", isAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isAdmin) {
        return actor.getAllLeads();
      }
      const principal = identity?.getPrincipal();
      if (!principal) return [];
      return actor.getLeadsAssignedToUser(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<SocialPost[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalReach() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalReach"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalReach();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalEngagement() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalEngagement"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalEngagement();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTasks(isAdmin: boolean) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Task[]>({
    queryKey: ["tasks", isAdmin],
    queryFn: async () => {
      if (!actor) return [];
      if (isAdmin) {
        return actor.getAllTasks();
      }
      const principal = identity?.getPrincipal();
      if (!principal) return [];
      return actor.getTasksAssignedToUser(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCampaigns() {
  const { actor, isFetching } = useActor();
  return useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCampaigns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useCreateLead() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      budget: number;
      source: string;
      stage: LeadStage;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      const lead: StudentLead = {
        id: BigInt(0),
        name: data.name,
        email: data.email,
        budget: BigInt(data.budget),
        source: data.source,
        stage: data.stage,
        notes: data.notes,
        assignedTo: principal,
        createdAt: BigInt(Date.now() * 1_000_000),
      };
      return actor.createLead(lead);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["countActiveLeads"] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lead }: { id: bigint; lead: StudentLead }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateStudentLead(id, lead);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStudentLead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["countActiveLeads"] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      platform: string;
      contentPillar: string;
      reach: number;
      engagement: number;
      campaignName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const post: SocialPost = {
        id: BigInt(0),
        platform: data.platform,
        contentPillar: data.contentPillar,
        reach: BigInt(data.reach),
        engagement: BigInt(data.engagement),
        campaignName: data.campaignName,
        publishDate: BigInt(Date.now() * 1_000_000),
      };
      return actor.createPost(post);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["totalReach"] });
      qc.invalidateQueries({ queryKey: ["totalEngagement"] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, post }: { id: bigint; post: SocialPost }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSocialPost(id, post);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["totalReach"] });
      qc.invalidateQueries({ queryKey: ["totalEngagement"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSocialPost(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["totalReach"] });
      qc.invalidateQueries({ queryKey: ["totalEngagement"] });
    },
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      priority: string;
      status: string;
      dueDate?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      const dueDateMs = data.dueDate
        ? new Date(data.dueDate).getTime()
        : Date.now();
      const task: Task = {
        id: BigInt(0),
        title: data.title,
        priority: data.priority,
        status: data.status,
        assignedTo: principal,
        dueDate: BigInt(dueDateMs * 1_000_000),
      };
      return actor.createTask(task);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, task }: { id: bigint; task: Task }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTask(id, task);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { fullName: string; role: string }) => {
      if (!actor) throw new Error("Not connected");
      const principal = identity?.getPrincipal() ?? Principal.anonymous();
      const profile: UserProfile = {
        userId: principal,
        fullName: data.fullName,
        role: data.role,
      };
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useCreateCampaign() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      platform: string;
      budget: number;
      startDate: string;
      endDate: string;
      reach: number;
      engagement: number;
      status: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const campaign: Campaign = {
        id: BigInt(0),
        name: data.name,
        platform: data.platform,
        budget: BigInt(data.budget),
        startDate: data.startDate,
        endDate: data.endDate,
        reach: BigInt(data.reach),
        engagement: BigInt(data.engagement),
        status: data.status,
      };
      return actor.createCampaign(campaign);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useUpdateCampaign() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: Campaign }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCampaign(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useDeleteCampaign() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCampaign(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: { userId: Principal; role: string }) => {
      if (!actor) throw new Error("Not connected");
      const userRole =
        role === "admin"
          ? UserRole.admin
          : role === "user"
            ? UserRole.user
            : UserRole.guest;
      return actor.assignCallerUserRole(userId, userRole);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProfiles"] }),
  });
}

export { LeadStage };
export type { StudentLead, SocialPost, Task, Campaign, UserProfile };
