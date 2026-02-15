"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarIcon, DollarSignIcon, MapPinIcon, UserIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  stage: "NEW" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  source?: string;
  estimatedValue?: number;
  lastContact?: string;
  property?: {
    address: string;
    city: string;
    state: string;
  };
}

interface Claim {
  id: string;
  claimNumber: string;
  insuranceCompany: string;
  typeOfLoss: string;
  dateOfLoss: string;
  status: "NEW" | "INVESTIGATING" | "DOCUMENTED" | "SUBMITTED" | "APPROVED" | "PAID" | "CLOSED";
  estimatedValue?: number;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    address: string;
    city: string;
    state: string;
  };
}

type Item = Lead | Claim;
type StageType = Lead["stage"] | Claim["status"];

interface KanbanColumnProps {
  id: string;
  title: string;
  items: Item[];
  itemType: "lead" | "claim";
}

interface KanbanItemProps {
  item: Item;
  itemType: "lead" | "claim";
}

// Sortable item component
function SortableKanbanItem({ item, itemType }: KanbanItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const elementRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    elementRef.current = node;
  };

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    el.style.transform = CSS.Transform.toString(transform) ?? "";
    el.style.transition = transition ?? "";
  }, [transform, transition]);

  return (
    <div
      ref={setRefs}
      className={`cursor-grab transition-opacity active:cursor-grabbing ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      {...attributes}
      {...listeners}
    >
      <KanbanItemCard item={item} itemType={itemType} />
    </div>
  );
}

// Item card component
function KanbanItemCard({ item, itemType }: KanbanItemProps) {
  if (itemType === "lead") {
    const lead = item as Lead;
    const daysSinceContact = lead.lastContact
      ? Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <Card className="rounded-xl border-2 border-muted transition-all hover:border-primary hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-white">
                {lead.firstName.charAt(0)}
                {lead.lastName.charAt(0)}
              </div>
              <CardTitle className="truncate text-sm font-semibold">
                {lead.firstName} {lead.lastName}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="whitespace-nowrap text-xs font-medium">
              {lead.stage}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.property && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {lead.property.city}, {lead.property.state}
              </span>
            </div>
          )}
          {lead.estimatedValue && (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <DollarSignIcon className="h-3.5 w-3.5 flex-shrink-0" />$
              {(lead.estimatedValue / 100).toLocaleString()}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-muted pt-2">
            {lead.source && (
              <Badge variant="outline" className="text-xs">
                {lead.source}
              </Badge>
            )}
            {lead.lastContact && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{daysSinceContact === 0 ? "Today" : `${daysSinceContact}d ago`}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  } else {
    const claim = item as Claim;
    return (
      <Card className="mb-3 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium">{claim.claimNumber}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {claim.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center text-xs text-muted-foreground">
            <UserIcon className="mr-1 h-3 w-3" />
            {claim.contact.firstName} {claim.contact.lastName}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPinIcon className="mr-1 h-3 w-3" />
            {claim.property.address}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {new Date(claim.dateOfLoss).toLocaleDateString()}
          </div>
          {claim.estimatedValue && (
            <div className="flex items-center text-xs text-muted-foreground">
              <DollarSignIcon className="mr-1 h-3 w-3" />$
              {(claim.estimatedValue / 100).toLocaleString()}
            </div>
          )}
          <Badge variant="outline" className="text-xs">
            {claim.typeOfLoss}
          </Badge>
          <div className="text-xs text-muted-foreground">{claim.insuranceCompany}</div>
        </CardContent>
      </Card>
    );
  }
}

// Column component with droppable functionality
function KanbanColumn({ id, title, items, itemType }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[600px] w-80 rounded-xl p-4 transition-all ${
        isOver ? "bg-primary/10 shadow-lg ring-2 ring-primary" : "bg-muted/50"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide">{title}</h3>
        <Badge variant="outline" className="text-xs font-bold">
          {items.length}
        </Badge>
      </div>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item) => (
            <SortableKanbanItem key={item.id} item={item} itemType={itemType} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanBoardProps {
  type: "leads" | "claims";
}

export default function KanbanBoard({ type }: KanbanBoardProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Define stages/statuses based on type
  const stages =
    type === "leads"
      ? [
          { id: "NEW", title: "New Leads" },
          { id: "QUALIFIED", title: "Qualified" },
          { id: "PROPOSAL", title: "Proposal Sent" },
          { id: "NEGOTIATION", title: "Negotiation" },
          { id: "WON", title: "Won" },
          { id: "LOST", title: "Lost" },
        ]
      : [
          { id: "NEW", title: "New Claims" },
          { id: "INVESTIGATING", title: "Investigating" },
          { id: "DOCUMENTED", title: "Documented" },
          { id: "SUBMITTED", title: "Submitted" },
          { id: "APPROVED", title: "Approved" },
          { id: "PAID", title: "Paid" },
          { id: "CLOSED", title: "Closed" },
        ];

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${type}`);
      if (response.ok) {
        const json = await response.json();
        // Handle different response structures
        const data = type === "leads" ? json.leads || json : json.claims || json;

        // Transform leads data to match expected structure
        if (type === "leads") {
          const transformedLeads = data.map((lead: any) => ({
            id: lead.id,
            firstName: lead.contacts?.firstName || "Unknown",
            lastName: lead.contacts?.lastName || "",
            email: lead.contacts?.email || "",
            phone: lead.contacts?.phone,
            stage: lead.stage?.toUpperCase() || "NEW",
            source: lead.source || "",
            estimatedValue: lead.value,
            lastContact: lead.updatedAt,
            property: lead.contacts
              ? {
                  address: lead.contacts.street || "",
                  city: lead.contacts.city || "",
                  state: lead.contacts.state || "",
                }
              : undefined,
          }));
          setItems(transformedLeads);
        } else {
          // Transform claims data
          const transformedClaims = data.map((claim: any) => ({
            id: claim.id,
            claimNumber: claim.claimNumber || `CLM-${claim.id.slice(0, 8)}`,
            insuranceCompany: claim.insurance_company || "Unknown",
            typeOfLoss: claim.type_of_loss || "Unknown",
            dateOfLoss: claim.date_of_loss || claim.createdAt,
            status: claim.lifecycleStage?.toUpperCase() || "NEW",
            estimatedValue: claim.total_claim_amount,
            contact: {
              firstName: claim.insured_name?.split(" ")[0] || "Unknown",
              lastName: claim.insured_name?.split(" ").slice(1).join(" ") || "",
              email: claim.properties?.primaryEmail || "",
            },
            properties: {
              address: claim.properties?.address || "",
              city: claim.properties?.city || "",
              state: claim.properties?.state || "",
            },
          }));
          setItems(transformedClaims);
        }
      } else {
        throw new Error(`Failed to fetch ${type}`);
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      toast.error(`Failed to load ${type}`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = items.find((item) => item.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeItem = items.find((item) => item.id === active.id);
    if (!activeItem) return;

    // Extract stage from droppable id (format: "stage-STAGE_NAME")
    const newStage = over.id.toString().replace("stage-", "") as StageType;
    const currentStage =
      type === "leads" ? (activeItem as Lead).stage : (activeItem as Claim).status;

    if (newStage === currentStage) return;

    try {
      // Update item stage/status
      const updateField = type === "leads" ? "stage" : "status";
      const response = await fetch(`/api/${type}/${activeItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [updateField]: newStage }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${type.slice(0, -1)}`);
      }

      // Update local state
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === activeItem.id ? { ...item, [updateField]: newStage } : item
        )
      );

      toast.success(`${type.slice(0, -1)} updated successfully`);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(`Failed to update ${type.slice(0, -1)}`);
    }
  };

  const getItemsForStage = (stageId: string) => {
    return items.filter((item) => {
      const stage = type === "leads" ? (item as Lead).stage : (item as Claim).status;
      return stage === stageId;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading {type}...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold capitalize">{type} Pipeline</h2>
        <Button onClick={loadItems} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} id={`stage-${stage.id}`}>
              <KanbanColumn
                id={stage.id}
                title={stage.title}
                items={getItemsForStage(stage.id)}
                itemType={type === "leads" ? "lead" : "claim"}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <KanbanItemCard item={activeItem} itemType={type === "leads" ? "lead" : "claim"} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
