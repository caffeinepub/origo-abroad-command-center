import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NewTaskModal } from "../components/modals/NewTaskModal";
import type { Task } from "../hooks/useQueries";
import { useAllTasks, useDeleteTask, useUpdateTask } from "../hooks/useQueries";

interface TasksPageProps {
  isAdmin: boolean;
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  High: { color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  Medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Low: { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
};

const STATUS_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Done: CheckCircle2,
  InProgress: Clock,
  Pending: Circle,
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export function TasksPage({ isAdmin }: TasksPageProps) {
  const { data: tasks, isLoading } = useAllTasks(isAdmin);
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: bigint, status: string, task: Task) => {
    try {
      await updateTask.mutateAsync({ id, task: { ...task, status } });
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-4" data-ocid="tasks.page">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${(tasks ?? []).length} tasks`}
        </p>
        <NewTaskModal>
          <Button size="sm" data-ocid="tasks.add_task.button">
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </NewTaskModal>
      </div>

      <NewTaskModal
        task={editTask ?? undefined}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <div
        className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1"
        data-ocid="tasks.list"
      >
        {isLoading ? (
          SKELETON_KEYS.map((k) => (
            <div
              key={k}
              className="rounded-xl bg-card border border-border p-4"
            >
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : (tasks ?? []).length === 0 ? (
          <div
            className="flex items-center justify-center py-16 text-muted-foreground text-sm"
            data-ocid="tasks.empty_state"
          >
            No tasks yet. Create your first task.
          </div>
        ) : (
          (tasks ?? []).map((task, i) => {
            const pCfg = PRIORITY_CONFIG[task.priority] ?? {
              color: "#9AAABD",
              bg: "rgba(154,170,189,0.12)",
            };
            const StatusIcon = STATUS_ICONS[task.status] ?? Circle;
            return (
              <div
                key={Number(task.id)}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
                data-ocid={`tasks.item.${i + 1}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusIcon
                    className={`w-4 h-4 flex-shrink-0 ${task.status === "Done" ? "text-green-400" : task.status === "InProgress" ? "text-yellow-400" : "text-muted-foreground"}`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${task.status === "Done" ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{ color: pCfg.color, backgroundColor: pCfg.bg }}
                  >
                    {task.priority}
                  </span>
                  <Select
                    value={task.status}
                    onValueChange={(v) => handleStatusChange(task.id, v, task)}
                  >
                    <SelectTrigger
                      className="h-7 w-28 text-xs bg-muted/30 border-border"
                      data-ocid={`tasks.status.select.${i + 1}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => handleEdit(task)}
                    data-ocid={`tasks.edit_button.${i + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === task.id}
                      onClick={() => handleDelete(task.id)}
                      data-ocid={`tasks.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
