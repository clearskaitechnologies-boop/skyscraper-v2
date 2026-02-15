import { AlertCircle,Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CodeCallout = {
  code: string;
  section: string;
  text: string;
};

interface CodeCalloutsEditorProps {
  value?: CodeCallout[];
  onChange: (value: CodeCallout[]) => void;
}

export default function CodeCalloutsEditor({ value, onChange }: CodeCalloutsEditorProps) {
  const [callouts, setCallouts] = useState<CodeCallout[]>(value || []);

  const addCallout = () => {
    const newCallouts = [...callouts, { code: "IRC", section: "R905.2", text: "" }];
    setCallouts(newCallouts);
    onChange(newCallouts);
  };

  const updateCallout = (index: number, field: keyof CodeCallout, val: string) => {
    const newCallouts = callouts.map((callout, i) =>
      i === index ? { ...callout, [field]: val } : callout
    );
    setCallouts(newCallouts);
    onChange(newCallouts);
  };

  const removeCallout = (index: number) => {
    const newCallouts = callouts.filter((_, i) => i !== index);
    setCallouts(newCallouts);
    onChange(newCallouts);
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Code & Compliance Callouts</h3>
        </div>
        <Button onClick={addCallout} size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Callout
        </Button>
      </div>

      <div className="space-y-4">
        {callouts.map((callout, index) => (
          <div key={index} className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`code-${index}`} className="text-xs">
                    Code
                  </Label>
                  <Input
                    id={`code-${index}`}
                    value={callout.code}
                    onChange={(e) => updateCallout(index, "code", e.target.value)}
                    placeholder="IRC, IBC, etc."
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor={`section-${index}`} className="text-xs">
                    Section
                  </Label>
                  <Input
                    id={`section-${index}`}
                    value={callout.section}
                    onChange={(e) => updateCallout(index, "section", e.target.value)}
                    placeholder="R905.2"
                    className="h-9"
                  />
                </div>
              </div>
              <Button
                onClick={() => removeCallout(index)}
                size="sm"
                variant="ghost"
                className="mt-5 h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor={`text-${index}`} className="text-xs">
                Requirement Description
              </Label>
              <Textarea
                id={`text-${index}`}
                value={callout.text}
                onChange={(e) => updateCallout(index, "text", e.target.value)}
                placeholder="Describe the code requirement and how it applies to this project..."
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        ))}

        {callouts.length === 0 && (
          <div className="rounded-lg border-2 border-dashed py-12 text-center text-sm text-muted-foreground">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p>No code callouts yet.</p>
            <p className="mt-1 text-xs">
              Add relevant building code requirements for this project.
            </p>
          </div>
        )}
      </div>

      {callouts.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong>Tip:</strong> Common codes include IRC (International Residential Code), IBC
          (International Building Code), and local jurisdiction-specific requirements.
        </div>
      )}
    </Card>
  );
}
