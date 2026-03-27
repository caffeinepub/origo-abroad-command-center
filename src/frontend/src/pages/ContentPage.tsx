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
import { NewPostModal } from "../components/modals/NewPostModal";
import type { SocialPost } from "../hooks/useQueries";
import { useAllPosts, useDeletePost } from "../hooks/useQueries";

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  TikTok: "#69C9D0",
  YouTube: "#FF0000",
  Google: "#4285F4",
  Email: "#F59E0B",
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];
const SKELETON_CELLS = ["a", "b", "c", "d", "e", "f", "g"];

export function ContentPage() {
  const { data: posts, isLoading } = useAllPosts();
  const deletePost = useDeletePost();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [editPost, setEditPost] = useState<SocialPost | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deletePost.mutateAsync(id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditPost(post);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-4" data-ocid="content.page">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${(posts ?? []).length} total posts`}
        </p>
        <NewPostModal>
          <Button size="sm" data-ocid="content.add_post.button">
            <Plus className="w-4 h-4 mr-1" /> New Post Record
          </Button>
        </NewPostModal>
      </div>

      <NewPostModal
        post={editPost ?? undefined}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <div
        className="rounded-xl bg-card border border-border overflow-hidden"
        data-ocid="content.table"
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
                Content Pillar
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Reach
              </TableHead>
              <TableHead className="text-xs text-muted-foreground text-right">
                Engagement
              </TableHead>
              <TableHead className="text-xs text-muted-foreground w-20" />
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
            ) : (posts ?? []).length === 0 ? (
              <TableRow className="border-border">
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="content.empty_state"
                >
                  No post records yet. Add your first post record.
                </TableCell>
              </TableRow>
            ) : (
              (posts ?? []).map((post, i) => (
                <TableRow
                  key={Number(post.id)}
                  className="border-border hover:bg-muted/20"
                  data-ocid={`content.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-foreground">
                    {post.campaignName}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        color: PLATFORM_COLORS[post.platform] ?? "#9AAABD",
                        backgroundColor: `${PLATFORM_COLORS[post.platform] ?? "#9AAABD"}22`,
                      }}
                    >
                      {post.platform}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.contentPillar}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {formatK(Number(post.reach))}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {formatK(Number(post.engagement))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(post)}
                        data-ocid={`content.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post.id)}
                        data-ocid={`content.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
