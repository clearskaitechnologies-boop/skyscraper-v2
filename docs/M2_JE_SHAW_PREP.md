# M2: JE Shaw Integration - Preparation Guide

## Overview

This document outlines the foundation for JE Shaw Maps integration. Once API credentials are provided, we'll implement:

1. **je_assets Database Table** - Store normalized aerial features
2. **Admin Sync Panel** - "Sync Now" button to pull latest data
3. **Edge Function** - `/je-sync` to fetch and normalize features
4. **Workbench Integration** - "Load from JE Shaw" button in Property step

## What We Need from JE Shaw

### 1. API Endpoint & Authentication

```
Base URL: https://api.jeshaw.example/v1
Auth Method: Bearer Token / API Key / HMAC?
```

**Questions:**

- What's the authentication scheme? (Bearer token, API key header, HMAC signature?)
- Rate limits? (requests per minute/hour)
- Pagination? (if result sets are large)

### 2. Sample JSON Response

We need examples for these layers:

- **Hail** (hail hits, size, date)
- **Wind** (wind swaths, speed, event date)
- **Roof Risk** (risk scores, confidence)

**Ideal format we'll normalize to:**

```json
{
  "features": [
    {
      "id": "ext-feature-123",
      "layer": "hail",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-112.074036, 33.448377],
            [-112.073036, 33.448377],
            [-112.073036, 33.449377],
            [-112.074036, 33.449377],
            [-112.074036, 33.448377]
          ]
        ]
      },
      "properties": {
        "max_hail_size_in": 1.25,
        "event_date": "2024-07-21",
        "confidence": 0.92,
        "severity": "moderate",
        "source_version": "v2025.1"
      },
      "captured_at": "2024-07-21T17:03:12Z"
    }
  ]
}
```

### 3. Query Parameters

How do we filter data? Examples:

- By lat/lon + radius? `?lat=33.448&lon=-112.074&radius_mi=1`
- By APN/parcel ID? `?apn=123-45-678`
- By property address? `?address=...`
- Date range? `?from=2024-01-01&to=2024-12-31`

## Database Schema (Ready to Deploy)

### je_assets Table

```sql
-- Normalized JE Shaw features
CREATE TABLE IF NOT EXISTS public.je_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_id text NOT NULL,                    -- JE Shaw's feature ID
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  layer text NOT NULL,                     -- 'hail', 'wind', 'roof_risk', etc.
  feature_type text,                       -- e.g., 'hail_hit', 'wind_swath'
  severity text,                           -- 'low', 'moderate', 'high'
  geometry jsonb NOT NULL,                 -- GeoJSON geometry
  attributes jsonb DEFAULT '{}',           -- Raw properties from JE Shaw
  captured_at timestamptz,                 -- When JE Shaw captured this data
  source_version text,                     -- JE Shaw data version
  synced_at timestamptz DEFAULT now(),     -- When we pulled it
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_je_assets_property ON je_assets(property_id);
CREATE INDEX idx_je_assets_layer ON je_assets(layer);
CREATE INDEX idx_je_assets_captured ON je_assets(captured_at DESC);
CREATE INDEX idx_je_assets_ext_id ON je_assets(ext_id);

-- Enable RLS
ALTER TABLE je_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read je_assets
CREATE POLICY "Authenticated users can view je_assets"
  ON je_assets FOR SELECT
  TO authenticated
  USING (true);

-- Policy: System/admins can insert/update
CREATE POLICY "Admins can manage je_assets"
  ON je_assets FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'owner'::app_role)
  );
```

### Sync Logs Table (Optional but Recommended)

```sql
-- Track sync history for debugging
CREATE TABLE IF NOT EXISTS public.je_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',  -- 'running', 'success', 'error'
  layers text[] DEFAULT '{}',              -- ['hail', 'wind', 'roof_risk']
  features_pulled integer DEFAULT 0,
  features_upserted integer DEFAULT 0,
  error_message text,
  triggered_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sync_logs_started ON je_sync_logs(started_at DESC);

ALTER TABLE je_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON je_sync_logs FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'owner'::app_role)
  );
```

## Edge Function Stub

**File**: `supabase/functions/je-sync/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin/owner
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "owner"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create sync log entry
    const { data: logEntry } = await supabase
      .from("je_sync_logs")
      .insert({
        triggered_by: user.id,
        status: "running",
        layers: ["hail", "wind", "roof_risk"],
      })
      .select()
      .single();

    // TODO: Fetch from JE Shaw API
    const jeShawUrl = Deno.env.get("JE_SHAW_API_URL");
    const jeShawToken = Deno.env.get("JE_SHAW_API_TOKEN");

    if (!jeShawUrl || !jeShawToken) {
      await supabase
        .from("je_sync_logs")
        .update({
          status: "error",
          error_message: "JE Shaw credentials not configured",
          completed_at: new Date().toISOString(),
        })
        .eq("id", logEntry!.id);

      return new Response(
        JSON.stringify({
          ok: false,
          message:
            "JE Shaw API not configured. Add JE_SHAW_API_URL and JE_SHAW_API_TOKEN to environment variables.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Implement actual sync once API details are provided
    // For now, return success with placeholder
    await supabase
      .from("je_sync_logs")
      .update({
        status: "success",
        features_pulled: 0,
        features_upserted: 0,
        completed_at: new Date().toISOString(),
      })
      .eq("id", logEntry!.id);

    return new Response(
      JSON.stringify({
        ok: true,
        message: "JE Shaw sync function ready. Waiting for API credentials.",
        syncLogId: logEntry!.id,
        pulled: 0,
        upserted: 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in je-sync:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**Config**: Add to `supabase/config.toml`

```toml
[functions.je-sync]
verify_jwt = true
```

## Admin Panel Component (Stub)

**File**: `src/components/admin/JESyncPanel.tsx`

```tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JESyncPanel() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<any>(null);
  const { toast } = useToast();

  async function handleSync() {
    setSyncing(true);

    try {
      const { data, error } = await supabase.functions.invoke("je-sync", {
        method: "POST",
      });

      if (error) throw error;

      setLastSync(data);

      toast({
        title: data.ok ? "Sync Complete" : "Sync Failed",
        description: data.message,
        variant: data.ok ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync with JE Shaw",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          JE Shaw Sync
          {lastSync?.ok ? (
            <Badge variant="default">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Ready
            </Badge>
          ) : lastSync === null ? (
            <Badge variant="secondary">Not Synced</Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" /> Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pull latest aerial imagery, hail, wind, and roof risk data from JE Shaw Maps.
        </p>

        {lastSync && (
          <div className="space-y-1 rounded-lg bg-muted/50 p-4 text-sm">
            <div>
              <strong>Last Sync:</strong> {lastSync.message}
            </div>
            {lastSync.pulled !== undefined && (
              <>
                <div>
                  <strong>Features Pulled:</strong> {lastSync.pulled}
                </div>
                <div>
                  <strong>Features Saved:</strong> {lastSync.upserted}
                </div>
              </>
            )}
          </div>
        )}

        <Button onClick={handleSync} disabled={syncing} className="w-full">
          {syncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> JE Shaw API credentials must be configured in environment variables
          (JE_SHAW_API_URL and JE_SHAW_API_TOKEN).
        </div>
      </CardContent>
    </Card>
  );
}
```

## Workbench Integration (Stub)

Add to Property step in `/report-workbench`:

```tsx
async function loadFromJEShaw() {
  setLoading(true);

  try {
    // Query je_assets for this property
    const { data, error } = await supabase
      .from("je_assets")
      .select("*")
      .eq("property_id", currentPropertyId)
      .order("captured_at", { ascending: false });

    if (error) throw error;

    // Group by layer
    const byLayer = data.reduce(
      (acc, asset) => {
        if (!acc[asset.layer]) acc[asset.layer] = [];
        acc[asset.layer].push(asset);
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Store snapshot in report
    setReport((prev) => ({
      ...prev,
      je_snapshot: byLayer,
    }));

    toast({
      title: "JE Shaw Data Loaded",
      description: `Found ${data.length} features across ${Object.keys(byLayer).length} layers`,
    });
  } catch (error: any) {
    toast({
      title: "Load Failed",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}
```

## Next Steps

Once JE Shaw provides:

1. ✅ API endpoint & auth token
2. ✅ Sample JSON for hail/wind/roof layers
3. ✅ Query parameter format

We'll:

1. Run the database migration (je_assets + je_sync_logs tables)
2. Complete the Edge Function with actual API calls
3. Add JESyncPanel to Admin page
4. Wire "Load from JE Shaw" button in Workbench
5. Test end-to-end flow

**Estimated time to complete M2 after receiving API details: 2-3 hours**
