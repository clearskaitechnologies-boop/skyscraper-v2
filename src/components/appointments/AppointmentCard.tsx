"use client";

import { ArrowRight, Calendar, Clock, MapPin, MoreVertical, User } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentCardProps {
  id: string;
  title: string;
  scheduledFor: Date;
  contractorName?: string;
  propertyAddress?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  leadId?: string;
  claimId?: string;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export function AppointmentCard({
  id,
  title,
  scheduledFor,
  contractorName,
  propertyAddress,
  status,
  notes,
  leadId,
  claimId,
  onEdit,
  onCancel,
  onComplete,
}: AppointmentCardProps) {
  const statusColors = {
    SCHEDULED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Determine the job URL - prioritize claim over lead
  const jobUrl = claimId ? `/claims/${claimId}` : leadId ? `/leads/${leadId}` : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Badge variant="outline" className={statusColors[status]}>
                {status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDate(scheduledFor)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatTime(scheduledFor)}</span>
              </div>

              {contractorName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0" />
                  <span>{contractorName}</span>
                </div>
              )}

              {propertyAddress && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{propertyAddress}</span>
                </div>
              )}
            </div>

            {notes && <p className="border-l-2 pl-3 text-sm text-muted-foreground">{notes}</p>}

            {status === "SCHEDULED" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {jobUrl && (
                  <Button size="sm" variant="default" asChild>
                    <Link href={jobUrl}>
                      View Job
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(id)}>
                    Edit
                  </Button>
                )}
                {onComplete && (
                  <Button size="sm" variant="outline" onClick={() => onComplete(id)}>
                    Mark Complete
                  </Button>
                )}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {jobUrl && (
                <DropdownMenuItem asChild>
                  <Link href={jobUrl}>View Job</Link>
                </DropdownMenuItem>
              )}
              {onEdit && <DropdownMenuItem onClick={() => onEdit(id)}>Edit</DropdownMenuItem>}
              {status === "SCHEDULED" && onComplete && (
                <DropdownMenuItem onClick={() => onComplete(id)}>Mark Complete</DropdownMenuItem>
              )}
              {status === "SCHEDULED" && onCancel && (
                <DropdownMenuItem onClick={() => onCancel(id)} className="text-destructive">
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
