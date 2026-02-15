// src/components/project-board/UnifiedProjectBoard.tsx
"use client";

import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Home,
  MapPin,
  Search,
  Shield,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Pipeline stages for all job types
const PIPELINE_STAGES = [
  { id: "NEW", label: "New/Intake", color: "bg-slate-500", icon: FileText },
  { id: "QUALIFIED", label: "Qualified", color: "bg-blue-500", icon: CheckCircle2 },
  { id: "inspection_scheduled", label: "Inspection", color: "bg-cyan-500", icon: Calendar },
  { id: "PROPOSAL", label: "Proposal", color: "bg-purple-500", icon: FileText },
  { id: "NEGOTIATION", label: "Negotiation", color: "bg-indigo-500", icon: Users },
  { id: "in_review", label: "In Review", color: "bg-yellow-500", icon: Clock },
  { id: "approved", label: "Approved", color: "bg-green-500", icon: CheckCircle2 },
  { id: "in_production", label: "In Production", color: "bg-teal-500", icon: Home },
  { id: "WON", label: "Completed/Won", color: "bg-emerald-600", icon: CheckCircle2 },
  { id: "invoiced", label: "Invoiced", color: "bg-lime-600", icon: DollarSign },
  { id: "paid", label: "Paid", color: "bg-green-700", icon: DollarSign },
] as const;

// Job category filters
const JOB_CATEGORIES = [
  { value: "all", label: "All Jobs", icon: Briefcase },
  { value: "lead", label: "Leads", icon: Briefcase },
  { value: "claim", label: "Insurance Claims", icon: Shield },
  { value: "financed", label: "Financed", icon: FileText },
  { value: "out_of_pocket", label: "Out of Pocket", icon: DollarSign },
  { value: "repair", label: "Repairs", icon: Wrench },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "claim":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "financed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "out_of_pocket":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "repair":
      return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "claim":
      return "Claim";
    case "financed":
      return "Financed";
    case "out_of_pocket":
      return "Retail";
    case "repair":
      return "Repair";
    default:
      return "Lead";
  }
};

interface Job {
  id: string;
  title: string;
  description?: string;
  stage: string;
  jobCategory: string;
  value?: number;
  contactName?: string;
  contactEmail?: string;
  address?: string;
  source?: string;
  assignedTo?: string;
  createdAt: string;
  claimId?: string; // For claims, link to claim workspace
}

export default function UnifiedProjectBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      // Fetch leads (which now include all job categories)
      const leadsRes = await fetch("/api/leads?limit=100");
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        const leads = (leadsData.leads || []).map((lead: any) => ({
          id: lead.id,
          title:
            lead.title ||
            `${lead.contacts?.firstName || ""} ${lead.contacts?.lastName || ""}`.trim() ||
            "Untitled",
          description: lead.description,
          stage: lead.stage || "NEW",
          jobCategory: lead.jobCategory || "lead",
          value: lead.value ? lead.value / 100 : undefined,
          contactName: lead.contacts
            ? `${lead.contacts.firstName || ""} ${lead.contacts.lastName || ""}`.trim()
            : undefined,
          contactEmail: lead.contacts?.email,
          address: lead.contacts
            ? `${lead.contacts.street || ""}, ${lead.contacts.city || ""} ${lead.contacts.state || ""}`.trim()
            : undefined,
          source: lead.source,
          assignedTo: lead.assignedTo,
          createdAt: lead.createdAt,
          claimId: lead.claimId,
        }));
        setJobs(leads);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateJobStage(jobId: string, newStage: string) {
    try {
      await fetch(`/api/leads/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch (error) {
      console.error("Failed to update job stage:", error);
    }
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const jobId = draggableId;
    const newStage = destination.droppableId;

    // Optimistic update
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, stage: newStage } : job)));

    // API update
    updateJobStage(jobId, newStage);
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || job.jobCategory === filterCategory;

    return matchesSearch && matchesCategory;
  });

  function getJobsInStage(stageId: string) {
    return filteredJobs.filter((job) => job.stage === stageId);
  }

  // Calculate category stats
  const categoryStats = JOB_CATEGORIES.filter((c) => c.value !== "all").map((cat) => ({
    ...cat,
    count: jobs.filter((j) => j.jobCategory === cat.value).length,
    value: jobs
      .filter((j) => j.jobCategory === cat.value)
      .reduce((sum, j) => sum + (j.value || 0), 0),
  }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading project board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {categoryStats.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() =>
                setFilterCategory(filterCategory === String(cat.value) ? "all" : String(cat.value))
              }
              className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                String(filterCategory) === String(cat.value)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {cat.label}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {cat.count}
                </span>
                {cat.value > 0 && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ${cat.value.toLocaleString()}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search jobs, contacts, addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-slate-300 bg-white pl-10 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            {JOB_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button asChild variant="default">
          <Link href="/leads/new">+ New Job</Link>
        </Button>
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full min-w-max gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const jobsInStage = getJobsInStage(stage.id);
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex w-[280px] flex-shrink-0 flex-col">
                  {/* Column Header */}
                  <div
                    className={`${stage.color} flex items-center justify-between rounded-t-xl px-4 py-3`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {jobsInStage.length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`max-h-[600px] min-h-[400px] flex-1 space-y-3 overflow-y-auto rounded-b-xl border-x border-b border-slate-300 bg-slate-100/50 p-3 dark:border-slate-800 dark:bg-slate-900/50 ${
                          snapshot.isDraggingOver ? "border-blue-500 bg-blue-500/10" : ""
                        }`}
                      >
                        {jobsInStage.map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <Link
                                href={job.claimId ? `/claims/${job.claimId}` : `/leads/${job.id}`}
                              >
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-move border-slate-300 bg-white p-4 transition-all hover:border-blue-500 dark:border-slate-700 dark:bg-slate-800 ${
                                    snapshot.isDragging
                                      ? "rotate-2 shadow-2xl ring-2 ring-blue-500"
                                      : ""
                                  }`}
                                >
                                  <div className="space-y-2">
                                    {/* Category Badge */}
                                    <Badge className={getCategoryColor(job.jobCategory)}>
                                      {getCategoryLabel(job.jobCategory)}
                                    </Badge>

                                    {/* Title */}
                                    <p className="line-clamp-2 font-medium text-slate-900 dark:text-white">
                                      {job.title}
                                    </p>

                                    {/* Contact */}
                                    {job.contactName && (
                                      <div className="flex items-center gap-2">
                                        <Users className="h-3 w-3 text-slate-400" />
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                          {job.contactName}
                                        </p>
                                      </div>
                                    )}

                                    {/* Address */}
                                    {job.address && job.address !== ", " && (
                                      <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                                        <p className="line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
                                          {job.address}
                                        </p>
                                      </div>
                                    )}

                                    {/* Value */}
                                    {job.value && job.value > 0 && (
                                      <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                                        <DollarSign className="h-3 w-3" />
                                        {job.value.toLocaleString()}
                                      </div>
                                    )}

                                    {/* Source */}
                                    {job.source && (
                                      <p className="text-xs text-slate-500">via {job.source}</p>
                                    )}
                                  </div>
                                </Card>
                              </Link>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {jobsInStage.length === 0 && (
                          <div className="flex h-32 items-center justify-center text-sm text-slate-500 dark:text-slate-600">
                            No jobs in this stage
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
