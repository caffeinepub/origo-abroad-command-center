import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Shield, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProfiles,
  useAssignRole,
  useCallerProfile,
  useSaveProfile,
} from "../hooks/useQueries";

interface SettingsPageProps {
  isAdmin: boolean;
}

export function SettingsPage({ isAdmin }: SettingsPageProps) {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useCallerProfile();
  const saveProfile = useSaveProfile();
  const { data: allProfiles, isLoading: profilesLoading } = useAllProfiles();
  const assignRole = useAssignRole();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setRole(profile.role);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({ fullName, role });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleAssignRole = async (userId: string, newRole: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await assignRole.mutateAsync({
        userId: Principal.fromText(userId),
        role: newRole,
      });
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const principal = identity?.getPrincipal().toString() ?? "--";

  return (
    <div className="max-w-3xl space-y-6" data-ocid="settings.page">
      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display font-semibold text-foreground">
            User Profile
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                data-ocid="settings.fullname.input"
                className="bg-muted/30 border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Role</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Marketing Manager"
                data-ocid="settings.role.input"
                className="bg-muted/30 border-border"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saveProfile.isPending}
              data-ocid="settings.save.button"
              className="w-full"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-foreground">
            Account Info
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Principal ID</p>
            <code className="text-xs text-foreground bg-muted/30 px-3 py-2 rounded-lg block break-all font-mono">
              {principal}
            </code>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div
          className="rounded-xl bg-card border border-border p-6 space-y-4"
          data-ocid="settings.team.panel"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-foreground">
              Team Management
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage team member roles and access levels.
          </p>

          {profilesLoading ? (
            <div className="space-y-2">
              {["a", "b", "c"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : (allProfiles ?? []).length === 0 ? (
            <div
              className="flex items-center justify-center h-20 text-muted-foreground text-sm"
              data-ocid="settings.team.empty_state"
            >
              No team members yet
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Principal
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground w-32">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allProfiles ?? []).map((p, i) => {
                    const userId = p.userId.toString();
                    const isCurrentAdmin =
                      p.role === "admin" || p.role === "marketing_head";
                    return (
                      <TableRow
                        key={userId}
                        className="border-border hover:bg-muted/20"
                        data-ocid={`settings.team.item.${i + 1}`}
                      >
                        <TableCell className="text-sm text-foreground font-medium py-3">
                          {p.fullName || "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              color: isCurrentAdmin ? "#22C55E" : "#9AAABD",
                              backgroundColor: isCurrentAdmin
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(154,170,189,0.12)",
                            }}
                          >
                            {p.role || "user"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <code className="text-xs text-muted-foreground font-mono">
                            {userId.length > 20
                              ? `${userId.slice(0, 10)}...${userId.slice(-6)}`
                              : userId}
                          </code>
                        </TableCell>
                        <TableCell className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={assignRole.isPending}
                            onClick={() =>
                              handleAssignRole(
                                userId,
                                isCurrentAdmin ? "user" : "admin",
                              )
                            }
                            data-ocid={`settings.team.toggle.${i + 1}`}
                          >
                            {isCurrentAdmin ? "Make Staff" : "Make Admin"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
