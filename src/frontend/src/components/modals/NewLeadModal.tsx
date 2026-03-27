import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StudentLead } from "../../hooks/useQueries";
import {
  LeadStage,
  useCreateLead,
  useUpdateLead,
} from "../../hooks/useQueries";

interface NewLeadModalProps {
  children?: React.ReactNode;
  lead?: StudentLead;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DEFAULT_FORM = {
  name: "",
  email: "",
  budget: "",
  source: "",
  stage: LeadStage.inquiry as string,
  notes: "",
};

export function NewLeadModal({
  children,
  lead,
  open: controlledOpen,
  onOpenChange,
}: NewLeadModalProps) {
  const isEdit = !!lead;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email,
        budget: String(Number(lead.budget)),
        source: lead.source,
        stage: lead.stage,
        notes: lead.notes,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [lead]);

  const isPending = createLead.isPending || updateLead.isPending;

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    try {
      if (isEdit && lead) {
        await updateLead.mutateAsync({
          id: lead.id,
          lead: {
            ...lead,
            name: form.name,
            email: form.email,
            budget: BigInt(Number(form.budget) || 0),
            source: form.source,
            stage: form.stage as LeadStage,
            notes: form.notes,
          },
        });
        toast.success("Lead updated");
      } else {
        await createLead.mutateAsync({
          name: form.name,
          email: form.email,
          budget: Number(form.budget) || 0,
          source: form.source,
          stage: form.stage as LeadStage,
          notes: form.notes,
        });
        toast.success("Lead created");
        setForm(DEFAULT_FORM);
      }
      setOpen(false);
    } catch {
      toast.error(isEdit ? "Failed to update lead" : "Failed to create lead");
    }
  };

  const dialogContent = (
    <DialogContent
      className="bg-card border-border"
      data-ocid="new_lead.dialog"
    >
      <DialogHeader>
        <DialogTitle className="font-display text-foreground">
          {isEdit ? "Edit Lead" : "New Student Lead"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Aisha Patel"
              data-ocid="new_lead.name.input"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email *</Label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="aisha@example.com"
              data-ocid="new_lead.email.input"
              className="bg-muted/30 border-border"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Source</Label>
            <Input
              value={form.source}
              onChange={(e) =>
                setForm((p) => ({ ...p, source: e.target.value }))
              }
              placeholder="Instagram, Referral..."
              data-ocid="new_lead.source.input"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Budget (USD)
            </Label>
            <Input
              type="number"
              value={form.budget}
              onChange={(e) =>
                setForm((p) => ({ ...p, budget: e.target.value }))
              }
              placeholder="5000"
              data-ocid="new_lead.budget.input"
              className="bg-muted/30 border-border"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Stage</Label>
          <Select
            value={form.stage}
            onValueChange={(v) => setForm((p) => ({ ...p, stage: v }))}
          >
            <SelectTrigger
              data-ocid="new_lead.stage.select"
              className="bg-muted/30 border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LeadStage.inquiry}>Inquiry</SelectItem>
              <SelectItem value={LeadStage.applied}>Applied</SelectItem>
              <SelectItem value={LeadStage.visa}>Visa</SelectItem>
              <SelectItem value={LeadStage.enrolled}>Enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Add any relevant notes..."
            rows={3}
            data-ocid="new_lead.notes.textarea"
            className="bg-muted/30 border-border resize-none"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          data-ocid="new_lead.cancel.button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          data-ocid="new_lead.submit.button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Lead"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (children) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {dialogContent}
    </Dialog>
  );
}
