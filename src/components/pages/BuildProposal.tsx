import { ArrowLeft, ArrowRight, CheckCircle2, MapPin,Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const STEPS = [
  "Property Info",
  "Date of Loss",
  "Photo Upload",
  "Damage Assessment",
  "Code Check",
  "Materials",
  "Review",
  "Generate",
];

const BuildProposal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [address, setAddress] = useState("");
  const [propertyProfile, setPropertyProfile] = useState<any>(null);
  const [selectedDOL, setSelectedDOL] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const weatherEvents = [
    { date: "2024-07-12", hailSize: 2.1, maxWind: 70, severity: "High" },
    { date: "2024-06-28", hailSize: 1.5, maxWind: 55, severity: "Medium" },
    { date: "2024-05-15", hailSize: 1.0, maxWind: 45, severity: "Low" },
  ];

  const handleLookup = () => {
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setPropertyProfile({
        owner: "John Smith",
        yearBuilt: 2008,
        roofAreaSqft: 2400,
        roofType: "Asphalt Shingle",
        stories: 2,
      });
      toast.success("Property found!");
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
      toast.success(`${e.target.files.length} photo(s) uploaded`);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navigation />

      {/* Progress Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Progress value={progress} className="h-2" />
          <div className="mt-4 flex justify-between overflow-x-auto">
            {STEPS.map((step, idx) => (
              <div
                key={step}
                className={`flex min-w-[80px] flex-col items-center ${
                  idx === currentStep
                    ? "text-primary"
                    : idx < currentStep
                      ? "text-green-600"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                    idx === currentStep
                      ? "bg-primary text-primary-foreground"
                      : idx < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-muted"
                  }`}
                >
                  {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <span className="text-center text-xs">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep]}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Enter the property address to get started"}
              {currentStep === 1 && "Select the most likely date of loss based on weather data"}
              {currentStep === 2 && "Upload photos of the roof damage"}
              {currentStep === 3 && "AI will analyze damage and provide scoring"}
              {currentStep === 4 && "Check applicable building codes"}
              {currentStep === 5 && "Select materials and generate estimate"}
              {currentStep === 6 && "Review all information before generating"}
              {currentStep === 7 && "Generate final report and claims packet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Property Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Property Address</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="address"
                      placeholder="123 Main St, Denver, CO 80202"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleLookup}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Lookup
                    </Button>
                  </div>
                </div>

                {propertyProfile && (
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                    <h3 className="mb-3 font-semibold">Property Profile</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Owner:</span>
                        <p className="font-medium">{propertyProfile.owner}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Year Built:</span>
                        <p className="font-medium">{propertyProfile.yearBuilt}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Roof Area:</span>
                        <p className="font-medium">{propertyProfile.roofAreaSqft} sq ft</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Roof Type:</span>
                        <p className="font-medium">{propertyProfile.roofType}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date of Loss */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Based on weather data, here are the most likely dates of loss:
                </p>
                <RadioGroup value={selectedDOL} onValueChange={setSelectedDOL}>
                  {weatherEvents.map((event) => (
                    <div
                      key={event.date}
                      className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <RadioGroupItem value={event.date} id={event.date} />
                      <Label htmlFor={event.date} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{event.date}</p>
                            <p className="text-sm text-muted-foreground">
                              Hail: {event.hailSize}" • Wind: {event.maxWind} mph
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              event.severity === "High"
                                ? "bg-red-100 text-red-700"
                                : event.severity === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {event.severity}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Photo Upload */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed p-12 text-center transition-colors hover:border-primary">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <Label htmlFor="photos" className="cursor-pointer">
                    <p className="mb-1 font-medium">Upload Roof Photos</p>
                    <p className="text-sm text-muted-foreground">
                      Click to select or drag and drop
                    </p>
                  </Label>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                {photos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Files:</p>
                    {photos.map((photo, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded border p-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{photo.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other steps would be implemented similarly */}
            {currentStep >= 3 && currentStep < 7 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Step {currentStep + 1} content would be implemented here
                </p>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4 py-12 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
                <h3 className="text-2xl font-bold">Ready to Generate!</h3>
                <p className="text-muted-foreground">
                  All information collected. Click generate to create your claims packet.
                </p>
                <Button size="lg" className="mt-4">
                  Generate Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 7 && (
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuildProposal;
