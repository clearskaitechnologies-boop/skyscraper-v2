import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CRMMap() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Map View</h1>
      <Card>
        <CardHeader>
          <CardTitle>Geographic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Interactive map interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
