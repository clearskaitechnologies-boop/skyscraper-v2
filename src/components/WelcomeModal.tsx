import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to ClearSKai</DialogTitle>
          <DialogDescription>
            You're signed in and ready to build your first report. Here are common next steps:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              Open <strong>Report Workbench</strong> and choose Retail/Insurance/Inspection
            </li>
            <li>
              Click <strong>Load from JE Shaw</strong> (once credentials are live) or proceed with
              photos/notes
            </li>
            <li>
              Use <strong>AI Summarize</strong> in Findings, then <strong>Generate PDF</strong> in
              Preview
            </li>
          </ol>

          <div className="flex justify-end gap-3 pt-4">
            <Link to="/features">
              <Button variant="outline">Explore Features</Button>
            </Link>
            <Link to="/report-workbench">
              <Button>Start a Report</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
