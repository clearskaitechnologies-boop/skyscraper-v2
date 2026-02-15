import { Bell,Building2, FileText, Users } from "lucide-react";
import { toast } from "sonner";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">
              <Building2 className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="mr-2 h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Company Branding</CardTitle>
                <CardDescription>Customize your company information and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="ClearSKai Inc." className="mt-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="contact@clearskai.com"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" defaultValue="(555) 123-4567" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      defaultValue="123 Business St, Denver, CO 80202"
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-lg">
                        CS
                      </div>
                      <Button variant="outline">Upload Logo</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color (SKai Blue)</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          defaultValue="#0EA5E9"
                          className="h-10 w-20"
                        />
                        <Input defaultValue="#0EA5E9" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accentColor">Accent Color (Energy Yellow)</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          defaultValue="#FACC15"
                          className="h-10 w-20"
                        />
                        <Input defaultValue="#FACC15" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave}>Save Branding</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team members and their roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Invite team members</p>
                    <p className="text-xs text-muted-foreground">
                      Add new people to your organization
                    </p>
                  </div>
                  <Button>Invite Member</Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  {[
                    { name: "John Doe", email: "john@example.com", role: "Admin" },
                    { name: "Jane Smith", email: "jane@example.com", role: "Editor" },
                    { name: "Bob Johnson", email: "bob@example.com", role: "Viewer" },
                  ].map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Customize your report templates and defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { name: "Standard Claims Packet", count: 12 },
                    { name: "Insurance Estimate", count: 8 },
                    { name: "Property Assessment", count: 15 },
                    { name: "Custom Template", count: 3 },
                  ].map((template, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Used {template.count} times
                          </p>
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: "Email Notifications",
                    description: "Receive email updates about your projects",
                  },
                  { title: "Report Generation", description: "Notify when reports are ready" },
                  { title: "Team Activity", description: "Updates when team members make changes" },
                  { title: "Weather Alerts", description: "Get alerts for severe weather events" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                ))}

                <Separator />

                <Button onClick={handleSave}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
