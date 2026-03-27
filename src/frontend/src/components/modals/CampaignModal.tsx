import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Campaign } from "../../hooks/useQueries";
import { useCreateCampaign, useUpdateCampaign } from "../../hooks/useQueries";

interface CampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
}

const PLATFORMS = [
  "Instagram",
  "Facebook",
  "YouTube",
  "TikTok",
  "LinkedIn",
  "Google Ads",
  "Other",
];

const STATUSES = ["planned", "active", "completed", "paused"];

export function CampaignModal({
  open,
  onOpenChange,
  campaign,
}: CampaignModalProps) {
  const isEdit = !!campaign;
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("planned");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reach, setReach] = useState("");
  const [engagement, setEngagement] = useState("");

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setPlatform(campaign.platform);
      setStatus(campaign.status);
      setBudget(String(Number(campaign.budget)));
      setStartDate(campaign.startDate);
      setEndDate(campaign.endDate);
      setReach(String(Number(campaign.reach)));
      setEngagement(String(Number(campaign.engagement)));
    } else {
      setName("");
      setPlatform("");
      setStatus("planned");
      setBudget("");
      setStartDate("");
      setEndDate("");
      setReach("");
      setEngagement("");
    }
  }, [campaign]);

  const isPending = createCampaign.isPending || updateCampaign.isPending;

  const handleSubmit = async () => {
    if (!name || !platform) {
      toast.error("Name and platform are required");
      return;
    }
    try {
      if (isEdit && campaign) {
        await updateCampaign.mutateAsync({
          id: campaign.id,
          data: {
            ...campaign,
            name,
            platform,
            status,
            budget: BigInt(Number(budget) || 0),
            startDate,
            endDate,
            reach: BigInt(Number(reach) || 0),
            engagement: BigInt(Number(engagement) || 0),
          },
        });
        toast.success("Campaign updated");
      } else {
        await createCampaign.mutateAsync({
          name,
          platform,
          status,
          budget: Number(budget) || 0,
          startDate,
          endDate,
          reach: Number(reach) || 0,
          engagement: Number(engagement) || 0,
        });
        toast.success("Campaign created");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEdit ? "Failed to update campaign" : "Failed to create campaign",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-lg"
        data-ocid="campaign.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Campaign" : "New Campaign"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-sm text-muted-foreground">
              Campaign Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Enrollment Drive"
              className="bg-muted/30 border-border"
              data-ocid="campaign.name.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger
                className="bg-muted/30 border-border"
                data-ocid="campaign.platform.select"
              >
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                className="bg-muted/30 border-border"
                data-ocid="campaign.status.select"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Budget ($)</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0"
              className="bg-muted/30 border-border"
              data-ocid="campaign.budget.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Reach</Label>
            <Input
              type="number"
              value={reach}
              onChange={(e) => setReach(e.target.value)}
              placeholder="0"
              className="bg-muted/30 border-border"
              data-ocid="campaign.reach.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Engagement</Label>
            <Input
              type="number"
              value={engagement}
              onChange={(e) => setEngagement(e.target.value)}
              placeholder="0"
              className="bg-muted/30 border-border"
              data-ocid="campaign.engagement.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-muted/30 border-border"
              data-ocid="campaign.start_date.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-muted/30 border-border"
              data-ocid="campaign.end_date.input"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-ocid="campaign.cancel.button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            data-ocid="campaign.submit.button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Campaign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
