/**
 * PHASE 13.5 — DELIVERY STATUS TRACKER
 * Displays delivery history and status for carrier submissions
 * 
 * Shows:
 * - Delivery timeline
 * - Email open tracking
 * - Download tracking
 * - Response tracking
 * - Follow-up reminders
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Mail,
  XCircle,
} from 'lucide-react';
import { useEffect,useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CarrierDelivery {
  id: string;
  deliveryType: string;
  channel: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  downloadedAt?: string;
  firstResponseAt?: string;
  errorMessage?: string;
  carrier?: {
    name: string;
  };
}

interface DeliveryStatusTrackerProps {
  claimId: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-700',
    icon: Clock,
  },
  SENT: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-700',
    icon: Mail,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  OPENED: {
    label: 'Opened',
    color: 'bg-purple-100 text-purple-700',
    icon: Eye,
  },
  DOWNLOADED: {
    label: 'Downloaded',
    color: 'bg-indigo-100 text-indigo-700',
    icon: Download,
  },
  RESPONDED: {
    label: 'Responded',
    color: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Failed',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  BOUNCED: {
    label: 'Bounced',
    color: 'bg-orange-100 text-orange-700',
    icon: AlertCircle,
  },
};

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  depreciation: 'Depreciation Package',
  supplement: 'Supplement Request',
  inspection: 'Inspection Report',
  report: 'Claims Report',
  invoice: 'Final Invoice',
  weather: 'Weather Verification',
  full_packet: 'Full Claims Package',
};

export function DeliveryStatusTracker({ claimId }: DeliveryStatusTrackerProps) {
  const [deliveries, setDeliveries] = useState<CarrierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, [claimId]);

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/carrier/send?claimId=${claimId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch deliveries:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carrier Delivery Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Clock className="mr-2 h-5 w-5 animate-spin" />
            Loading delivery history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carrier Delivery Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carrier Delivery Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <Mail className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p>No deliveries yet</p>
            <p className="mt-1 text-sm">Use "Send to Carrier" to submit documentation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Carrier Delivery Status</span>
          <Badge variant="outline">{deliveries.length} submission(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.map((delivery) => {
            const statusConfig = STATUS_CONFIG[delivery.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={delivery.id}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {DELIVERY_TYPE_LABELS[delivery.deliveryType] || delivery.deliveryType}
                      </h4>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      To: {delivery.recipientName} ({delivery.recipientEmail})
                    </div>
                    {delivery.carrier && (
                      <div className="mt-0.5 text-xs text-gray-500">
                        Carrier: {delivery.carrier.name}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(delivery.sentAt), { addSuffix: true })}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-3 rounded bg-gray-50 p-2 text-sm text-gray-700">
                  <span className="font-medium">Subject:</span> {delivery.subject}
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  {/* Sent */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      Sent {new Date(delivery.sentAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Delivered */}
                  {delivery.deliveredAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Delivered {new Date(delivery.deliveredAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Opened */}
                  {delivery.openedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-700">
                        Opened {new Date(delivery.openedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Downloaded */}
                  {delivery.downloadedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="h-4 w-4 text-indigo-600" />
                      <span className="text-gray-700">
                        Downloaded {new Date(delivery.downloadedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Responded */}
                  {delivery.firstResponseAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      <span className="text-gray-700">
                        Received response {new Date(delivery.firstResponseAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Error */}
                  {delivery.errorMessage && (
                    <div className="mt-2 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-2 text-sm">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      <span className="text-red-700">{delivery.errorMessage}</span>
                    </div>
                  )}
                </div>

                {/* Follow-up needed? */}
                {delivery.status === 'SENT' && !delivery.openedAt && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <Clock className="h-4 w-4" />
                      <span>
                        Sent {formatDistanceToNow(new Date(delivery.sentAt), { addSuffix: true })} • Follow up if no response
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
