import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Lead {
  id: string;
  address: string;
  leadType?: string;
  status?: string;
  createdAt?: string;
}

interface RecentLeadsTableProps {
  leads?: Lead[];
}

const RecentLeadsTable = ({ leads = [] }: RecentLeadsTableProps) => {
  const navigate = useNavigate();

  const defaultLeads = [
    {
      id: "1",
      address: "123 Main St, Denver, CO",
      leadType: "Retail",
      status: "In Progress",
      createdAt: "2025-01-10",
    },
    {
      id: "2",
      address: "456 Oak Ave, Boulder, CO",
      leadType: "Insurance",
      status: "Pending",
      createdAt: "2025-01-09",
    },
    {
      id: "3",
      address: "789 Pine Rd, Aurora, CO",
      leadType: "Inspection",
      status: "Complete",
      createdAt: "2025-01-08",
    },
    {
      id: "4",
      address: "321 Elm St, Lakewood, CO",
      leadType: "Retail",
      status: "In Progress",
      createdAt: "2025-01-07",
    },
  ];

  const displayLeads = leads.length > 0 ? leads : defaultLeads;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Complete":
      case "completed":
        return "text-success";
      case "In Progress":
      case "in_progress":
        return "text-accent";
      case "Pending":
      case "pending":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  const formatLeadType = (type?: string) => {
    if (!type) return "Lead";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Leads</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/map")}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-primary"
              onClick={() => navigate(`/lead/new?address=${encodeURIComponent(lead.address)}`)}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{lead.address}</div>
                <div className="mt-1 flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {formatLeadType(lead.leadType)}
                  </span>
                  <span className={`text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {formatStatus(lead.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentLeadsTable;
