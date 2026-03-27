import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentLead {
    id: bigint;
    assignedTo: Principal;
    source: string;
    name: string;
    createdAt: Time;
    email: string;
    stage: LeadStage;
    notes: string;
    budget: bigint;
}
export type Time = bigint;
export interface Campaign {
    id: bigint;
    status: string;
    endDate: string;
    name: string;
    platform: string;
    budget: bigint;
    engagement: bigint;
    reach: bigint;
    startDate: string;
}
export interface Task {
    id: bigint;
    status: string;
    title: string;
    assignedTo: Principal;
    dueDate: Time;
    priority: string;
}
export interface SocialPost {
    id: bigint;
    publishDate: Time;
    contentPillar: string;
    platform: string;
    campaignName: string;
    engagement: bigint;
    reach: bigint;
}
export interface UserProfile {
    userId: Principal;
    role: string;
    fullName: string;
}
export enum LeadStage {
    enrolled = "enrolled",
    applied = "applied",
    visa = "visa",
    inquiry = "inquiry"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    countActiveLeads(): Promise<bigint>;
    createCampaign(newCampaign: Campaign): Promise<bigint>;
    createLead(lead: StudentLead): Promise<bigint>;
    createPost(post: SocialPost): Promise<bigint>;
    createTask(task: Task): Promise<bigint>;
    deleteCampaign(id: bigint): Promise<void>;
    deleteSocialPost(id: bigint): Promise<void>;
    deleteStudentLead(id: bigint): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getAllCampaigns(): Promise<Array<Campaign>>;
    getAllLeads(): Promise<Array<StudentLead>>;
    getAllPosts(): Promise<Array<SocialPost>>;
    getAllProfiles(): Promise<Array<UserProfile>>;
    getAllTasks(): Promise<Array<Task>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCampaign(id: bigint): Promise<Campaign | null>;
    getLead(id: bigint): Promise<StudentLead>;
    getLeadsAssignedToUser(userId: Principal): Promise<Array<StudentLead>>;
    getLeadsByStage(stage: LeadStage): Promise<Array<StudentLead>>;
    getPost(id: bigint): Promise<SocialPost>;
    getTask(id: bigint): Promise<Task>;
    getTasksAssignedToUser(userId: Principal): Promise<Array<Task>>;
    getTotalEngagement(): Promise<bigint>;
    getTotalReach(): Promise<bigint>;
    getUserProfile(userId: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCampaign(id: bigint, input: Campaign): Promise<void>;
    updateSocialPost(id: bigint, input: SocialPost): Promise<void>;
    updateStudentLead(id: bigint, input: StudentLead): Promise<void>;
    updateTask(id: bigint, input: Task): Promise<void>;
}
