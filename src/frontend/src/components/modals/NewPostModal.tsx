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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SocialPost } from "../../hooks/useQueries";
import { useCreatePost, useUpdatePost } from "../../hooks/useQueries";

interface NewPostModalProps {
  children?: React.ReactNode;
  post?: SocialPost;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DEFAULT_FORM = {
  platform: "Instagram",
  contentPillar: "",
  reach: "",
  engagement: "",
  campaignName: "",
};

export function NewPostModal({
  children,
  post,
  open: controlledOpen,
  onOpenChange,
}: NewPostModalProps) {
  const isEdit = !!post;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (post) {
      setForm({
        platform: post.platform,
        contentPillar: post.contentPillar,
        reach: String(Number(post.reach)),
        engagement: String(Number(post.engagement)),
        campaignName: post.campaignName,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [post]);

  const isPending = createPost.isPending || updatePost.isPending;

  const handleSubmit = async () => {
    if (!form.campaignName) {
      toast.error("Campaign name is required");
      return;
    }
    try {
      if (isEdit && post) {
        await updatePost.mutateAsync({
          id: post.id,
          post: {
            ...post,
            platform: form.platform,
            contentPillar: form.contentPillar,
            reach: BigInt(Number(form.reach) || 0),
            engagement: BigInt(Number(form.engagement) || 0),
            campaignName: form.campaignName,
          },
        });
        toast.success("Post updated");
      } else {
        await createPost.mutateAsync({
          platform: form.platform,
          contentPillar: form.contentPillar,
          reach: Number(form.reach) || 0,
          engagement: Number(form.engagement) || 0,
          campaignName: form.campaignName,
        });
        toast.success("Post record created");
        setForm(DEFAULT_FORM);
      }
      setOpen(false);
    } catch {
      toast.error(isEdit ? "Failed to update post" : "Failed to create post");
    }
  };

  const dialogContent = (
    <DialogContent
      className="bg-card border-border"
      data-ocid="new_post.dialog"
    >
      <DialogHeader>
        <DialogTitle className="font-display text-foreground">
          {isEdit ? "Edit Post Record" : "New Post Record"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Campaign Name *
          </Label>
          <Input
            value={form.campaignName}
            onChange={(e) =>
              setForm((p) => ({ ...p, campaignName: e.target.value }))
            }
            placeholder="Summer 2025 Reach Campaign"
            data-ocid="new_post.campaign.input"
            className="bg-muted/30 border-border"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <Select
              value={form.platform}
              onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}
            >
              <SelectTrigger
                data-ocid="new_post.platform.select"
                className="bg-muted/30 border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Content Pillar
            </Label>
            <Input
              value={form.contentPillar}
              onChange={(e) =>
                setForm((p) => ({ ...p, contentPillar: e.target.value }))
              }
              placeholder="Education, Testimonial..."
              data-ocid="new_post.pillar.input"
              className="bg-muted/30 border-border"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Reach</Label>
            <Input
              type="number"
              value={form.reach}
              onChange={(e) =>
                setForm((p) => ({ ...p, reach: e.target.value }))
              }
              placeholder="12500"
              data-ocid="new_post.reach.input"
              className="bg-muted/30 border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Engagement</Label>
            <Input
              type="number"
              value={form.engagement}
              onChange={(e) =>
                setForm((p) => ({ ...p, engagement: e.target.value }))
              }
              placeholder="840"
              data-ocid="new_post.engagement.input"
              className="bg-muted/30 border-border"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          data-ocid="new_post.cancel.button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          data-ocid="new_post.submit.button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "Saving..." : "Saving..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Save Record"
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
