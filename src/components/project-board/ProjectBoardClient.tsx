"use client";

import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Home,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Pipeline stages matching the spec
const PIPELINE_STAGES = [
  { id: "lead_intake", label: "Lead Intake", color: "bg-slate-500", icon: FileText },
  {
    id: "inspection_scheduled",
    label: "Inspection Scheduled",
    color: "bg-blue-500",
    icon: Calendar,
  },
  {
    id: "inspection_completed",
    label: "Inspection Completed",
    color: "bg-cyan-500",
    icon: CheckCircle2,
  },
  { id: "estimate_drafting", label: "Estimate Drafting", color: "bg-purple-500", icon: FileText },
  {
    id: "submitted_to_carrier",
    label: "Submitted to Carrier",
    color: "bg-indigo-500",
    icon: FileText,
  },
  { id: "in_review", label: "In Review", color: "bg-yellow-500", icon: Clock },
  { id: "supplementing", label: "Supplementing", color: "bg-orange-500", icon: AlertCircle },
  { id: "approved", label: "Approved", color: "bg-green-500", icon: CheckCircle2 },
  {
    id: "production_scheduled",
    label: "Production Scheduled",
    color: "bg-teal-500",
    icon: Calendar,
  },
  { id: "in_production", label: "In Production", color: "bg-blue-600", icon: Home },
  { id: "qc_punchlist", label: "QC / Punchlist", color: "bg-amber-500", icon: CheckCircle2 },
  { id: "completed", label: "Completed", color: "bg-emerald-600", icon: CheckCircle2 },
  { id: "invoiced", label: "Invoiced", color: "bg-lime-600", icon: DollarSign },
  { id: "paid", label: "Paid", color: "bg-green-700", icon: DollarSign },
] as const;

interface Claim {
  id: string;
  claimNumber: string;
  propertyAddress: string;
  homeownerName: string;
  stage: string;
  carrier?: string;
  adjuster?: string;
  estimateTotal?: number;
  assignedTo?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  lastActivity?: Date;
  zipCode?: string;
  orgId?: string;
}

export default function ProjectBoardClient() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterCarrier, setFilterCarrier] = useState<string>("all");

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    try {
      const response = await fetch("/api/claims/list");
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims || []);
      }
    } catch (error) {
      console.error("Failed to fetch claims:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateClaimStage(claimId: string, newStage: string) {
    try {
      await fetch("/api/claims/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, stage: newStage }),
      });
    } catch (error) {
      console.error("Failed to update claim stage:", error);
    }
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const claimId = draggableId;
    const newStage = destination.droppableId;

    // Optimistic update
    setClaims((prev) =>
      prev.map((claim) => (claim.id === claimId ? { ...claim, stage: newStage } : claim))
    );

    // API update
    updateClaimStage(claimId, newStage);
  }

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.homeownerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrg = filterOrg === "all" || claim.orgId === filterOrg;
    const matchesUser = filterUser === "all" || claim.assignedTo === filterUser;
    const matchesCarrier = filterCarrier === "all" || claim.carrier === filterCarrier;

    return matchesSearch && matchesOrg && matchesUser && matchesCarrier;
  });

  function getClaimsInStage(stageId: string) {
    return filteredClaims.filter((claim) => claim.stage === stageId);
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading project board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search claims, addresses, homeowners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-slate-300 bg-white pl-10 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <Select value={filterCarrier} onValueChange={setFilterCarrier}>
          <SelectTrigger className="w-[180px] border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Carriers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Carriers</SelectItem>
            <SelectItem value="state-farm">State Farm</SelectItem>
            <SelectItem value="allstate">Allstate</SelectItem>
            <SelectItem value="geico">GEICO</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-[180px] border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {/* Dynamic users would go here */}
          </SelectContent>
        </Select>
      </div>

      {/* Board */}
      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full min-w-max gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const claimsInStage = getClaimsInStage(stage.id);
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex w-[320px] flex-shrink-0 flex-col">
                  {/* Column Header */}
                  <div
                    className={`${stage.color} flex items-center justify-between rounded-t-xl px-4 py-3`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {claimsInStage.length}
                    </Badge>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`project-board-content flex-1 space-y-3 overflow-y-auto rounded-b-xl border-x border-b border-slate-300 bg-slate-100/50 p-3 dark:border-slate-800 dark:bg-slate-900/50 ${
                          snapshot.isDraggingOver ? "border-blue-500 bg-blue-500/10" : ""
                        }`}
                      >
                        {claimsInStage.map((claim, index) => (
                          <Draggable key={claim.id} draggableId={claim.id} index={index}>
                            {(provided, snapshot) => (
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
                                <div className="space-y-3">
                                  {/* Priority Badge */}
                                  {claim.priority && (
                                    <div className="flex items-start justify-between">
                                      <Badge
                                        className={`${getPriorityColor(claim.priority)} text-xs text-white`}
                                      >
                                        {claim.priority.toUpperCase()}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* Claim Number */}
                                  <div>
                                    <p className="font-mono text-xs text-slate-500 dark:text-slate-500">
                                      {claim.claimNumber}
                                    </p>
                                  </div>

                                  {/* Address */}
                                  <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                                    <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">
                                      {claim.propertyAddress}
                                    </p>
                                  </div>

                                  {/* Homeowner */}
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-slate-400" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      {claim.homeownerName}
                                    </p>
                                  </div>

                                  {/* Carrier/Adjuster */}
                                  {claim.carrier && (
                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                      <span className="font-medium">{claim.carrier}</span>
                                      {claim.adjuster && <span> · {claim.adjuster}</span>}
                                    </div>
                                  )}

                                  {/* Estimate */}
                                  {claim.estimateTotal && (
                                    <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                                      <DollarSign className="h-4 w-4" />
                                      {claim.estimateTotal.toLocaleString()}
                                    </div>
                                  )}

                                  {/* Assigned To */}
                                  {claim.assignedTo && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-indigo font-medium text-white">
                                        {claim.assignedTo.charAt(0).toUpperCase()}
                                      </div>
                                      <span>{claim.assignedTo}</span>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {claimsInStage.length === 0 && (
                          <div className="flex h-32 items-center justify-center text-sm text-slate-500 dark:text-slate-600">
                            No claims in this stage
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
