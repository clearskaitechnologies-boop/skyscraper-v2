import { Building2,Ruler } from "lucide-react";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWizardStore } from "@/stores/wizardStore";

import { WizardScreen } from "../WizardScreen";

export const DetailsScreen: React.FC = () => {
  const { jobData, updateJobData, completeStep } = useWizardStore();
  const [roofArea, setRoofArea] = useState(jobData.roofArea?.toString() || "");
  const [stories, setStories] = useState(jobData.stories?.toString() || "");
  const [roofType, setRoofType] = useState(jobData.roofType || "");
  const [notes, setNotes] = useState(jobData.notes || "");

  const canProgress = roofArea && stories && roofType;

  const handleNext = () => {
    updateJobData({
      roofArea: parseInt(roofArea),
      stories: parseInt(stories),
      roofType,
      notes,
    });
    completeStep("details");
  };

  return (
    <WizardScreen onNext={handleNext} canProgress={!!canProgress}>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Ruler className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
            <p className="text-gray-600">Tell us about the structure</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roofArea">Roof Area (sq ft)</Label>
              <Input
                id="roofArea"
                type="number"
                placeholder="2500"
                value={roofArea}
                onChange={(e) => setRoofArea(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="stories">Number of Stories</Label>
              <Input
                id="stories"
                type="number"
                placeholder="2"
                value={stories}
                onChange={(e) => setStories(e.target.value)}
                className="mt-1"
                min="1"
                max="10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="roofType">Roof Type</Label>
            <select
              id="roofType"
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select roof type...</option>
              <option value="asphalt-shingle">Asphalt Shingle</option>
              <option value="metal">Metal</option>
              <option value="tile">Tile</option>
              <option value="flat">Flat</option>
              <option value="slate">Slate</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special details about the property..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>
      </div>
    </WizardScreen>
  );
};
