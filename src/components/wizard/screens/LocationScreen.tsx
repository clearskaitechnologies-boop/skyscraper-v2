import { MapPin } from "lucide-react";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/stores/wizardStore";

import { WizardScreen } from "../WizardScreen";

export const LocationScreen: React.FC = () => {
  const { jobData, updateJobData, completeStep } = useWizardStore();
  const [address, setAddress] = useState(jobData.address || "");
  const [city, setCity] = useState(jobData.city || "");
  const [state, setState] = useState(jobData.state || "");
  const [zip, setZip] = useState(jobData.zip || "");

  const canProgress = address && city && state && zip;

  const handleNext = () => {
    updateJobData({ address, city, state, zip });
    completeStep("location");
  };

  return (
    <WizardScreen onNext={handleNext} canProgress={!!canProgress}>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Where's the job located?</h2>
            <p className="text-gray-600">We'll use this to generate accurate measurements</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Springfield"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="IL"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              type="text"
              placeholder="62701"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="mt-1"
              maxLength={5}
            />
          </div>
        </div>
      </div>
    </WizardScreen>
  );
};
