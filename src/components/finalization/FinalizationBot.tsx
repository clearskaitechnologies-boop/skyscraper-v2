/**
 * PHASE 15 — FINALIZATION BOT UI
 * Complete claim finalization dashboard
 */

'use client';

import { AlertCircle, Archive,Award, CheckCircle2, Circle, FileText, Star, Users } from 'lucide-react';
import { useEffect,useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FinalizationBotProps {
  claimId: string;
}

interface FinalizationStatus {
  isReady: boolean;
  isClosed: boolean;
  isArchived: boolean;
  buildComplete: boolean;
  docsUploaded: boolean;
  depreciationReceived: boolean;
  invoiceIssued: boolean;
  supplementsComplete: boolean;
  timelineVerified: boolean;
  homeownerSigned: boolean;
  finalPacketGenerated: boolean;
  warrantyActivated: boolean;
  reviewRequested: boolean;
  referralRequested: boolean;
  homeownerNotified: boolean;
  finalPacketUrl?: string;
  homeownerPacketUrl?: string;
  archivedAt?: string;
  closedAt?: string;
}

export default function FinalizationBot({ claimId }: FinalizationBotProps) {
  const [status, setStatus] = useState<FinalizationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [missingItems, setMissingItems] = useState<string[]>([]);

  useEffect(() => {
    fetchStatus();
  }, [claimId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/finalization?claimId=${claimId}`);
      const data = await res.json();
      if (data.exists) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch finalization status:', error);
    }
  };

  const checkReadiness = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_readiness', claimId }),
      });
      const data = await res.json();
      setMissingItems(data.missingItems || []);
      await fetchStatus();
    } catch (error) {
      console.error('Failed to check readiness:', error);
    }
    setLoading(false);
  };

  const generatePackets = async () => {
    setLoading(true);
    try {
      await fetch('/api/finalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_packets', claimId }),
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to generate packets:', error);
    }
    setLoading(false);
  };

  const activateWarranty = async () => {
    setLoading(true);
    try {
      await fetch('/api/finalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_warranty', claimId }),
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to activate warranty:', error);
    }
    setLoading(false);
  };

  const triggerClosure = async () => {
    setLoading(true);
    try {
      await fetch('/api/finalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_closure', claimId }),
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to trigger closure:', error);
    }
    setLoading(false);
  };

  const archiveClaim = async () => {
    if (!confirm('Are you sure you want to archive this claim? This will mark it as CLOSED.')) {
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/finalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', claimId }),
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to archive claim:', error);
    }
    setLoading(false);
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🤖 Finalization Bot</CardTitle>
          <CardDescription>Autonomous claim finalization system</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkReadiness} disabled={loading}>
            Check Finalization Readiness
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🤖 Finalization Bot</CardTitle>
              <CardDescription>Autonomous claim finalization system</CardDescription>
            </div>
            {status.isReady ? (
              <Badge className="bg-green-500">Ready to Close</Badge>
            ) : status.isClosed ? (
              <Badge className="bg-gray-500">Closed</Badge>
            ) : (
              <Badge variant="secondary">In Progress</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prerequisites */}
          <div>
            <h3 className="mb-3 font-semibold">📋 Prerequisites</h3>
            <div className="grid grid-cols-2 gap-2">
              <PrerequisiteItem
                label="Build Complete"
                complete={status.buildComplete}
              />
              <PrerequisiteItem
                label="Docs Uploaded"
                complete={status.docsUploaded}
              />
              <PrerequisiteItem
                label="Depreciation Received"
                complete={status.depreciationReceived}
              />
              <PrerequisiteItem
                label="Invoice Issued"
                complete={status.invoiceIssued}
              />
              <PrerequisiteItem
                label="Supplements Complete"
                complete={status.supplementsComplete}
              />
              <PrerequisiteItem
                label="Timeline Verified"
                complete={status.timelineVerified}
              />
              <PrerequisiteItem
                label="Homeowner Signed"
                complete={status.homeownerSigned}
              />
            </div>
          </div>

          {missingItems.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Missing Items:</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-amber-800">
                    {missingItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Button onClick={checkReadiness} disabled={loading} variant="outline" className="w-full">
            🔄 Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      {status.isReady && !status.isClosed && (
        <Card>
          <CardHeader>
            <CardTitle>⚡ Finalization Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!status.finalPacketGenerated && (
              <ActionButton
                icon={<FileText className="h-4 w-4" />}
                label="Generate Final Packets"
                description="Create adjuster and homeowner closeout packets"
                onClick={generatePackets}
                disabled={loading}
              />
            )}

            {status.finalPacketGenerated && (
              <div className="space-y-2">
                <a
                  href={status.finalPacketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start">
                    📄 Download Adjuster Packet
                  </Button>
                </a>
                <a
                  href={status.homeownerPacketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start">
                    📄 Download Homeowner Packet
                  </Button>
                </a>
              </div>
            )}

            {!status.warrantyActivated && (
              <ActionButton
                icon={<Award className="h-4 w-4" />}
                label="Activate Warranty"
                description="Activate manufacturer and workmanship warranty"
                onClick={activateWarranty}
                disabled={loading}
              />
            )}

            {!status.homeownerNotified && (
              <ActionButton
                icon={<Users className="h-4 w-4" />}
                label="Trigger Post-Closure Sequence"
                description="Send final emails, review/referral requests"
                onClick={triggerClosure}
                disabled={loading}
              />
            )}

            {status.finalPacketGenerated && (
              <ActionButton
                icon={<Archive className="h-4 w-4" />}
                label="Archive & Close Claim"
                description="Archive all files and mark claim as CLOSED"
                onClick={archiveClaim}
                disabled={loading}
                variant="destructive"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Post-Closure Status */}
      {status.homeownerNotified && (
        <Card>
          <CardHeader>
            <CardTitle>📬 Post-Closure Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <PostActionItem
              label="Warranty Activated"
              complete={status.warrantyActivated}
            />
            <PostActionItem
              label="Review Requested"
              complete={status.reviewRequested}
            />
            <PostActionItem
              label="Referral Requested"
              complete={status.referralRequested}
            />
            <PostActionItem
              label="Archived"
              complete={status.isArchived}
            />
          </CardContent>
        </Card>
      )}

      {status.isClosed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" />
              <h3 className="text-xl font-bold text-green-900">Claim Fully Closed!</h3>
              <p className="mt-2 text-green-700">
                Closed on {status.closedAt ? new Date(status.closedAt).toLocaleDateString() : 'N/A'}
              </p>
              {status.isArchived && (
                <p className="mt-1 text-sm text-green-600">
                  Archived on {status.archivedAt ? new Date(status.archivedAt).toLocaleDateString() : 'N/A'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PrerequisiteItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {complete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4 text-gray-300" />
      )}
      <span className={complete ? 'text-green-900' : 'text-gray-500'}>{label}</span>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  disabled,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      className="h-auto w-full justify-start py-3"
    >
      <div className="flex items-start gap-3 text-left">
        {icon}
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-xs opacity-80">{description}</div>
        </div>
      </div>
    </Button>
  );
}

function PostActionItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-3">
      <span>{label}</span>
      {complete ? (
        <Badge className="bg-green-500">Done</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      )}
    </div>
  );
}
