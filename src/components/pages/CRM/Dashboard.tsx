import {
  Activity,
  Building,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CRMDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Leads",
      value: "42",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Projects",
      value: "18",
      change: "+8%",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: "$45,320",
      change: "+23%",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Conversion Rate",
      value: "67%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  const recentLeads = [
    {
      id: 1,
      name: "John Smith",
      property: "123 Main St, Austin TX",
      status: "New",
      value: "$15,000",
      date: "Today",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      property: "456 Oak Ave, Dallas TX",
      status: "Qualified",
      value: "$22,500",
      date: "Yesterday",
    },
    {
      id: 3,
      name: "Mike Chen",
      property: "789 Pine Dr, Houston TX",
      status: "Proposal Sent",
      value: "$18,750",
      date: "2 days ago",
    },
  ];

  const quickActions = [
    {
      title: "Add New Lead",
      desc: "Create a new lead in your pipeline",
      icon: Plus,
      action: () => navigate("/leads/new"),
      color: "bg-blue-500",
    },
    {
      title: "Generate Report",
      desc: "Create AI-powered inspection report",
      icon: FileText,
      action: () => navigate("/report-workbench"),
      color: "bg-green-500",
    },
    {
      title: "View Properties",
      desc: "Manage your property portfolio",
      icon: Building,
      action: () => navigate("/map"),
      color: "bg-purple-500",
    },
    {
      title: "Schedule Inspection",
      desc: "Book a new property inspection",
      icon: Calendar,
      action: () => navigate("/inspections/new"),
      color: "bg-orange-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Proposal Sent":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => navigate("/leads/new")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
            <Button onClick={() => navigate("/report-workbench")} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Leads */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Leads</CardTitle>
                  <Button onClick={() => navigate("/leads")} variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="mr-1 h-3 w-3" />
                            {lead.property}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{lead.value}</div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          <span className="text-sm text-gray-500">{lead.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      variant="outline"
                      className="h-auto w-full justify-start p-4"
                    >
                      <div
                        className={`h-8 w-8 rounded-lg ${action.color} mr-3 flex items-center justify-center`}
                      >
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.desc}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>New lead from John Smith</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Report generated for 456 Oak Ave</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span>Proposal sent to Sarah Johnson</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span>Inspection scheduled for tomorrow</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
