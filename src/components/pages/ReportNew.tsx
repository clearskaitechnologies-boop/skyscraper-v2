import { ArrowRight,Camera, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ReportNew = () => {
  const navigate = useNavigate();

  const reportTypes = [
    {
      icon: FileText,
      title: "Claims-Ready Proposal",
      description: "Full insurance claim documentation with AI analysis",
      action: () => navigate("/build"),
    },
    {
      icon: Camera,
      title: "Inspection Report",
      description: "Quick inspection with photo documentation",
      action: () => navigate("/build"),
    },
    {
      icon: MapPin,
      title: "Property Assessment",
      description: "Pre-loss condition and damage assessment",
      action: () => navigate("/build"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Create New Report</h1>
          <p className="text-lg text-muted-foreground">
            Select the type of report you'd like to generate
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reportTypes.map((type, idx) => (
            <Card
              key={idx}
              className="group cursor-pointer transition-all hover:border-primary/50"
              onClick={type.action}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <type.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{type.title}</CardTitle>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                  Start
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportNew;
