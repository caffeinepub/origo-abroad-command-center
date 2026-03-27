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
import { CampaignModal } from "../components/modals/CampaignModal";
import type { Campaign } from "../hooks/useQueries";
import { useAllCampaigns, useDeleteCampaign } from "../hooks/useQueries";

interface CampaignsPageProps {
  isAdmin: boolean;
}

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  active: { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  Active: { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  paused: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Paused: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  completed: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Completed: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  planned: { color: "#9AAABD", bg: "rgba(154,170,189,0.12)" },
  Draft: { color: "#9AAABD", bg: "rgba(154,170,189,0.12)" },
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];
const SKELETON_CELLS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function CampaignsPage({ isAdmin }: CampaignsPageProps) {
  const { data: campaigns, isLoading } = useAllCampaigns();
  const deleteCampaign = useDeleteCampaign();

  const [modalOpen, setModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | undefined>(
    undefined,
  );

  const handleNewCampaign = () => {
    setEditCampaign(undefined);
    setModalOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditCampaign(campaign);
    setModalOpen(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    try {
      await deleteCampaign.mutateAsync(campaign.id);
      toast.success(`Campaign "${campaign.name}" deleted`);
    } catch {
      toast.error("Failed to delete campaign");
    }
  };

  return (
    <div className="space-y-4" data-ocid="campaigns.page">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${(campaigns ?? []).length} campaigns`}
        </p>
        <Button
          size="sm"
          onClick={handleNewCampaign}
          data-ocid="campaigns.open_modal_button"
          className="h-8 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
        </Button>
      </div>

      <div
        className="rounded-xl bg-card border border-border overflow-hidden"
        data-ocid="campaigns.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground">
                Campaign
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Platform
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Budget
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Reach
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Engagement
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Period
              </TableHead>
              <TableHead className="text-xs text-muted-foreground w-16">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              SKELETON_KEYS.map((k) => (
                <TableRow key={k} className="border-border">
                  {SKELETON_CELLS.map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (campaigns ?? []).length === 0 ? (
              <TableRow className="border-border">
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="campaigns.empty_state"
                >
                  No campaigns yet. Click &ldquo;New Campaign&rdquo; to get
                  started.
                </TableCell>
              </TableRow>
            ) : (
              (campaigns ?? []).map((campaign, i) => {
                const sCfg = STATUS_CONFIG[campaign.status] ?? {
                  color: "#9AAABD",
                  bg: "rgba(154,170,189,0.12)",
                };
                return (
                  <TableRow
                    key={Number(campaign.id)}
                    className="border-border hover:bg-muted/20 cursor-pointer"
                    onClick={() => handleEditCampaign(campaign)}
                    data-ocid={`campaigns.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-foreground">
                      {campaign.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {campaign.platform}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ color: sCfg.color, backgroundColor: sCfg.bg }}
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">
                      ${Number(campaign.budget).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">
                      {formatK(Number(campaign.reach))}
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">
                      {formatK(Number(campaign.engagement))}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {campaign.startDate} → {campaign.endDate}
                    </TableCell>
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="w-16"
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditCampaign(campaign)}
                          className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                          data-ocid={`campaigns.edit_button.${i + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(campaign)}
                            disabled={deleteCampaign.isPending}
                            className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete"
                            data-ocid={`campaigns.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      <CampaignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        campaign={editCampaign}
      />
    </div>
  );
}
