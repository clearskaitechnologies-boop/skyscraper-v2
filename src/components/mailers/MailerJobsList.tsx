"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle,ExternalLink, Filter, MapPin } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MailerJob {
  id: string;
  status: string;
  mailedAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  trackingUrl?: string;
  qrUrl?: string;
  toAddress: {
    name?: string;
    address_line1: string;
    address_city: string;
    address_state: string;
    address_zip: string;
  };
}

interface MailerJobsListProps {
  jobs: MailerJob[];
}

type FilterStatus = "all" | "queued" | "mailed" | "in_transit" | "delivered" | "failed";

export function MailerJobsList({ jobs }: MailerJobsListProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      job.toAddress.address_line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.toAddress.address_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.toAddress.address_zip.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Count by status
  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-600">Delivered</Badge>;
      case "in_transit":
        return <Badge className="bg-blue-600">In Transit</Badge>;
      case "mailed":
        return <Badge className="bg-purple-600">Mailed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "queued":
        return <Badge variant="secondary">Queued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Mailer Jobs</CardTitle>
            <CardDescription>{jobs.length} total addresses</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <Input
              placeholder="Search address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === "all" ? "All Statuses" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "all"}
                  onCheckedChange={() => setStatusFilter("all")}
                >
                  All ({jobs.length})
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "queued"}
                  onCheckedChange={() => setStatusFilter("queued")}
                >
                  Queued ({statusCounts.queued || 0})
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "mailed"}
                  onCheckedChange={() => setStatusFilter("mailed")}
                >
                  Mailed ({statusCounts.mailed || 0})
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "in_transit"}
                  onCheckedChange={() => setStatusFilter("in_transit")}
                >
                  In Transit ({statusCounts.in_transit || 0})
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "delivered"}
                  onCheckedChange={() => setStatusFilter("delivered")}
                >
                  Delivered ({statusCounts.delivered || 0})
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "failed"}
                  onCheckedChange={() => setStatusFilter("failed")}
                >
                  Failed ({statusCounts.failed || 0})
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mailed</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No mailers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{job.toAddress.address_line1}</div>
                          <div className="text-sm text-muted-foreground">
                            {job.toAddress.address_city}, {job.toAddress.address_state}{" "}
                            {job.toAddress.address_zip}
                          </div>
                          {job.errorMessage && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              {job.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      {job.mailedAt ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(job.mailedAt), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.deliveredAt ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(job.deliveredAt), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.trackingUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={job.trackingUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {job.qrUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={job.qrUrl} target="_blank" rel="noopener noreferrer">
                              QR
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredJobs.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} mailers
          </div>
        )}
      </CardContent>
    </Card>
  );
}
