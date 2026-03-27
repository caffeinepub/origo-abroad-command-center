import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NewLeadModal } from "../components/modals/NewLeadModal";
import type { StudentLead } from "../hooks/useQueries";
import { LeadStage, useAllLeads, useDeleteLead } from "../hooks/useQueries";

interface LeadsPageProps {
  isAdmin: boolean;
}

const STAGE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  [LeadStage.inquiry]: {
    label: "Inquiry",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
  },
  [LeadStage.applied]: {
    label: "Applied",
    color: "#22D3EE",
    bg: "rgba(34,211,238,0.12)",
  },
  [LeadStage.visa]: {
    label: "Visa",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
  },
  [LeadStage.enrolled]: {
    label: "Enrolled",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];

export function LeadsPage({ isAdmin }: LeadsPageProps) {
  const { data: leads, isLoading } = useAllLeads(isAdmin);
  const deleteLead = useDeleteLead();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [editLead, setEditLead] = useState<StudentLead | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteLead.mutateAsync(id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (lead: StudentLead) => {
    setEditLead(lead);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-4" data-ocid="leads.page">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${(leads ?? []).length} total leads`}
        </p>
        <NewLeadModal>
          <Button size="sm" data-ocid="leads.add_lead.button">
            <Plus className="w-4 h-4 mr-1" /> New Lead
          </Button>
        </NewLeadModal>
      </div>

      <NewLeadModal
        lead={editLead ?? undefined}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <div
        className="rounded-xl bg-card border border-border overflow-hidden"
        data-ocid="leads.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Source
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Stage
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Budget
              </TableHead>
              <TableHead className="text-xs text-muted-foreground w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              SKELETON_KEYS.map((k) => (
                <TableRow key={k} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : (leads ?? []).length === 0 ? (
              <TableRow className="border-border">
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="leads.empty_state"
                >
                  No leads found. Add your first lead to get started.
                </TableCell>
              </TableRow>
            ) : (
              (leads ?? []).map((lead, i) => {
                const cfg = STAGE_CONFIG[lead.stage] ?? {
                  label: lead.stage,
                  color: "#9AAABD",
                  bg: "rgba(154,170,189,0.12)",
                };
                return (
                  <TableRow
                    key={Number(lead.id)}
                    className="border-border hover:bg-muted/20"
                    data-ocid={`leads.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-foreground">
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {lead.email}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.source}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">
                      ${Number(lead.budget).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(lead)}
                          data-ocid={`leads.edit_button.${i + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === lead.id}
                            onClick={() => handleDelete(lead.id)}
                            data-ocid={`leads.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
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
