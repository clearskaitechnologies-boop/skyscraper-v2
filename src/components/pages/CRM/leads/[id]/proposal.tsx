import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProposalWizard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Proposal Wizard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Proposal</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Proposal creation wizard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
