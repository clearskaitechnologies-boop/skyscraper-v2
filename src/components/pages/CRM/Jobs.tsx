import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CRMJobs() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Jobs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Job listings and management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
