import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, Loader2, RefreshCw, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { useAllProfiles, useAssignRole } from "../hooks/useQueries";

export function StaffPage() {
  const { data: profiles, isLoading, refetch, isFetching } = useAllProfiles();
  const assignRole = useAssignRole();

  const handleToggleRole = async (userId: any, currentRole: string) => {
    const newRole =
      currentRole === "admin" || currentRole === "marketing_head"
        ? "user"
        : "admin";
    try {
      await assignRole.mutateAsync({ userId, role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="space-y-6" data-ocid="staff.page">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium">
            Staff Onboarding
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            New staff members must log in with Internet Identity first to appear
            here. Once they appear, you can assign their role.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${(profiles ?? []).length} registered users`}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          data-ocid="staff.refresh.button"
        >
          {isFetching ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          )}
          Refresh
        </Button>
      </div>

      <div
        className="rounded-xl bg-card border border-border overflow-hidden"
        data-ocid="staff.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Principal
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs text-muted-foreground w-28">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["a", "b", "c"].map((k) => (
                <TableRow key={k} className="border-border">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TableCell key={n}>
                      <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (profiles ?? []).length === 0 ? (
              <TableRow className="border-border">
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="staff.empty_state"
                >
                  No users registered yet.
                </TableCell>
              </TableRow>
            ) : (
              (profiles ?? []).map((profile, i) => {
                const isAdmin =
                  profile.role === "admin" || profile.role === "marketing_head";
                const pid = profile.userId.toString();
                const displayName = profile.fullName || `${pid.slice(0, 8)}...`;
                return (
                  <TableRow
                    key={pid}
                    className="border-border hover:bg-muted/20"
                    data-ocid={`staff.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-foreground">
                      {displayName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {pid.slice(0, 16)}...
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          isAdmin
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground bg-muted/30"
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {isAdmin ? "Admin" : "Staff"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-emerald-400 bg-emerald-400/10">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={assignRole.isPending}
                        onClick={() =>
                          handleToggleRole(profile.userId, profile.role)
                        }
                        data-ocid={`staff.toggle.button.${i + 1}`}
                      >
                        {isAdmin ? "Make Staff" : "Make Admin"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
