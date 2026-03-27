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
import type { Task } from "../../hooks/useQueries";
import { useCreateTask, useUpdateTask } from "../../hooks/useQueries";

interface NewTaskModalProps {
  children?: React.ReactNode;
  task?: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function bigintToDateString(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().split("T")[0];
}

const DEFAULT_FORM = {
  title: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
};

export function NewTaskModal({
  children,
  task,
  open: controlledOpen,
  onOpenChange,
}: NewTaskModalProps) {
  const isEdit = !!task;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        priority: task.priority,
        status: task.status,
        dueDate: bigintToDateString(task.dueDate),
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [task]);

  const isPending = createTask.isPending || updateTask.isPending;

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error("Task title is required");
      return;
    }
    try {
      if (isEdit && task) {
        const dueDateMs = form.dueDate
          ? new Date(form.dueDate).getTime()
          : Number(task.dueDate) / 1_000_000;
        await updateTask.mutateAsync({
          id: task.id,
          task: {
            ...task,
            title: form.title,
            priority: form.priority,
            status: form.status,
            dueDate: BigInt(dueDateMs * 1_000_000),
          },
        });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync({
          title: form.title,
          priority: form.priority,
          status: form.status,
          dueDate: form.dueDate,
        });
        toast.success("Task created");
        setForm(DEFAULT_FORM);
      }
      setOpen(false);
    } catch {
      toast.error(isEdit ? "Failed to update task" : "Failed to create task");
    }
  };

  const dialogContent = (
    <DialogContent
      className="bg-card border-border"
      data-ocid="new_task.dialog"
    >
      <DialogHeader>
        <DialogTitle className="font-display text-foreground">
          {isEdit ? "Edit Task" : "New Task"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Follow up with Ahmed about documents"
            data-ocid="new_task.title.input"
            className="bg-muted/30 border-border"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
            >
              <SelectTrigger
                data-ocid="new_task.priority.select"
                className="bg-muted/30 border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger
                data-ocid="new_task.status.select"
                className="bg-muted/30 border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Due Date</Label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, dueDate: e.target.value }))
            }
            data-ocid="new_task.due_date.input"
            className="bg-muted/30 border-border"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          data-ocid="new_task.cancel.button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          data-ocid="new_task.submit.button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Task"
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
