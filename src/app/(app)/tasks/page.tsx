"use client";

import { useUser } from "@clerk/nextjs";
import { Brain, CheckSquare, Clock, Loader2, Target, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  dueDate?: string;
  source: string;
  assigneeRole?: string;
  claimId?: string;
  assignedTo?: {
    id: string;
    name?: string;
    email?: string;
  };
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function TasksPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch all tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === "done" ? new Date().toISOString() : null,
        }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, status: newStatus as any } : task))
        );
      }
    } catch (error) {
      console.error("Update task error:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔴";
      case "high":
        return "🟠";
      case "normal":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterSource !== "all" && task.source !== filterSource) return false;
    return true;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    done: filteredTasks.filter((t) => t.status === "done"),
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const daysUntilDue = task.dueDate
      ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <Card
        className={`mb-3 cursor-pointer p-4 transition-shadow hover:shadow-md ${
          daysUntilDue !== null && daysUntilDue < 0 ? "border-red-300" : ""
        }`}
      >
        <div className="mb-2 flex items-start justify-between">
          <h4 className="flex-1 text-sm font-medium">{task.title}</h4>
          <span className="ml-2 text-lg">{getPriorityIcon(task.priority)}</span>
        </div>

        {task.description && (
          <p className="mb-3 text-xs text-muted-foreground">{task.description}</p>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {task.priority}
          </Badge>
          {task.source === "dominus_ai" && (
            <Badge variant="outline" className="text-xs">
              <Brain className="mr-1 h-3 w-3" />
              Dominus AI
            </Badge>
          )}
          {task.assigneeRole && (
            <Badge variant="outline" className="text-xs">
              <User className="mr-1 h-3 w-3" />
              {task.assigneeRole.replace("_", " ")}
            </Badge>
          )}
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-xs ${
              daysUntilDue !== null && daysUntilDue < 0
                ? "font-semibold text-red-600"
                : "text-muted-foreground"
            }`}
          >
            <Clock className="h-3 w-3" />
            {daysUntilDue !== null && daysUntilDue < 0
              ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? "s" : ""}`
              : daysUntilDue === 0
                ? "Due today"
                : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`}
          </div>
        )}

        {task.claimId && (
          <div className="mt-2 border-t pt-2">
            <Link
              href={`/claims/${task.claimId}`}
              className="text-xs text-blue-600 hover:underline"
            >
              View Claim →
            </Link>
          </div>
        )}

        <div className="mt-3">
          <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    );
  };

  return (
    <div className="container max-w-7xl py-8">
      <PageHero
        section="jobs"
        title="Tasks"
        subtitle="Manage all tasks across your claims"
        icon={<CheckSquare className="h-6 w-6" />}
      >
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[180px] border-white/30 bg-white/20 text-white">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="dominus_ai">Dominus AI</SelectItem>
            <SelectItem value="user">User Created</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </PageHero>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">No Tasks Yet</h3>
          <p className="mb-6 text-muted-foreground">
            Tasks will appear here when you accept Dominus AI recommendations or create them
            manually.
          </p>
          <Button asChild>
            <Link href="/claims">View Claims</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* TO DO COLUMN */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <h3 className="font-semibold">To Do</h3>
              <Badge variant="secondary">{tasksByStatus.todo.length}</Badge>
            </div>
            <div>
              {tasksByStatus.todo.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.todo.length === 0 && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No tasks to do
                </Card>
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <h3 className="font-semibold">In Progress</h3>
              <Badge variant="secondary">{tasksByStatus.in_progress.length}</Badge>
            </div>
            <div>
              {tasksByStatus.in_progress.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.in_progress.length === 0 && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No tasks in progress
                </Card>
              )}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <h3 className="font-semibold">Done</h3>
              <Badge variant="secondary">{tasksByStatus.done.length}</Badge>
            </div>
            <div>
              {tasksByStatus.done.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.done.length === 0 && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No completed tasks
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
