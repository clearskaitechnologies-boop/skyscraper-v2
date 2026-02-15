import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CRMProjects() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Projects</h1>
      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Project management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
