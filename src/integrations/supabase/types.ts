export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      ai_audit_insights: {
        Row: {
          category: string;
          confidence: number;
          created_at: string;
          id: number;
          incident_id: string | null;
          message: string;
          tenant_id: string | null;
        };
        Insert: {
          category: string;
          confidence: number;
          created_at?: string;
          id?: number;
          incident_id?: string | null;
          message: string;
          tenant_id?: string | null;
        };
        Update: {
          category?: string;
          confidence?: number;
          created_at?: string;
          id?: number;
          incident_id?: string | null;
          message?: string;
          tenant_id?: string | null;
        };
        Relationships: [];
      };
      ai_incidents: {
        Row: {
          confidence: number;
          events_count: number;
          first_seen: string;
          id: string;
          last_seen: string;
          message: string | null;
          scope: Json | null;
          signature: string;
          status: string;
          tenant_id: string | null;
        };
        Insert: {
          confidence?: number;
          events_count?: number;
          first_seen?: string;
          id?: string;
          last_seen?: string;
          message?: string | null;
          scope?: Json | null;
          signature: string;
          status?: string;
          tenant_id?: string | null;
        };
        Update: {
          confidence?: number;
          events_count?: number;
          first_seen?: string;
          id?: string;
          last_seen?: string;
          message?: string | null;
          scope?: Json | null;
          signature?: string;
          status?: string;
          tenant_id?: string | null;
        };
        Relationships: [];
      };
      app_logs: {
        Row: {
          created_at: string;
          event_type: string;
          id: number;
          metadata: Json | null;
          report_id: string | null;
          risk: number | null;
          tenant_id: string | null;
          userId: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: number;
          metadata?: Json | null;
          report_id?: string | null;
          risk?: number | null;
          tenant_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: number;
          metadata?: Json | null;
          report_id?: string | null;
          risk?: number | null;
          tenant_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      approval_docs: {
        Row: {
          created_at: string | null;
          id: string;
          mime: string | null;
          org_id: string;
          parsed: Json | null;
          report_id: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          mime?: string | null;
          org_id: string;
          parsed?: Json | null;
          report_id: string;
          storage_path: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          mime?: string | null;
          org_id?: string;
          parsed?: Json | null;
          report_id?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "approval_docs_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "approval_docs_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
          {
            foreignKeyName: "approval_docs_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "approval_docs_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_public_views: {
        Row: {
          created_at: string | null;
          event: string | null;
          id: number;
          ip: unknown | null;
          report_id: string | null;
          token: string | null;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string | null;
          event?: string | null;
          id?: number;
          ip?: unknown | null;
          report_id?: string | null;
          token?: string | null;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string | null;
          event?: string | null;
          id?: number;
          ip?: unknown | null;
          report_id?: string | null;
          token?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      client_report_assignments: {
        Row: {
          clientId: string;
          created_at: string | null;
          id: string;
          report_id: string;
        };
        Insert: {
          clientId: string;
          created_at?: string | null;
          id?: string;
          report_id: string;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          id?: string;
          report_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_report_assignments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_report_assignments_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_report_assignments_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          name: string | null;
          userId: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      code_compliance: {
        Row: {
          id: string;
          jurisdiction: string;
          last_updated: string;
          requirements: Json;
          source: string | null;
          zipCode: string | null;
        };
        Insert: {
          id?: string;
          jurisdiction: string;
          last_updated?: string;
          requirements?: Json;
          source?: string | null;
          zipCode?: string | null;
        };
        Update: {
          id?: string;
          jurisdiction?: string;
          last_updated?: string;
          requirements?: Json;
          source?: string | null;
          zipCode?: string | null;
        };
        Relationships: [];
      };
      code_findings: {
        Row: {
          citations: Json | null;
          code_ref: string | null;
          created_at: string | null;
          id: string;
          jurisdiction: string | null;
          material: string | null;
          org_id: string;
          report_id: string;
          severity: string | null;
          summary: string | null;
          title: string | null;
        };
        Insert: {
          citations?: Json | null;
          code_ref?: string | null;
          created_at?: string | null;
          id?: string;
          jurisdiction?: string | null;
          material?: string | null;
          org_id: string;
          report_id: string;
          severity?: string | null;
          summary?: string | null;
          title?: string | null;
        };
        Update: {
          citations?: Json | null;
          code_ref?: string | null;
          created_at?: string | null;
          id?: string;
          jurisdiction?: string | null;
          material?: string | null;
          org_id?: string;
          report_id?: string;
          severity?: string | null;
          summary?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "code_findings_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "code_findings_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
          {
            foreignKeyName: "code_findings_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "code_findings_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      demo_requests: {
        Row: {
          company: string | null;
          created_at: string | null;
          email: string;
          id: string;
          message: string | null;
          name: string;
          phone: string | null;
          utm: Json | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
          phone?: string | null;
          utm?: Json | null;
        };
        Update: {
          company?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string | null;
          utm?: Json | null;
        };
        Relationships: [];
      };
      error_logs: {
        Row: {
          code: string | null;
          context: Json | null;
          happened_at: string;
          id: number;
          message: string;
          report_id: string | null;
          severity: string;
          source: string;
          tenant_id: string | null;
        };
        Insert: {
          code?: string | null;
          context?: Json | null;
          happened_at?: string;
          id?: number;
          message: string;
          report_id?: string | null;
          severity?: string;
          source: string;
          tenant_id?: string | null;
        };
        Update: {
          code?: string | null;
          context?: Json | null;
          happened_at?: string;
          id?: number;
          message?: string;
          report_id?: string | null;
          severity?: string;
          source?: string;
          tenant_id?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          happened_at: string;
          id: number;
          name: string;
          props: Json | null;
          report_id: string | null;
          tenant_id: string | null;
          userId: string | null;
        };
        Insert: {
          happened_at?: string;
          id?: number;
          name: string;
          props?: Json | null;
          report_id?: string | null;
          tenant_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          happened_at?: string;
          id?: number;
          name?: string;
          props?: Json | null;
          report_id?: string | null;
          tenant_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      heartbeats: {
        Row: {
          last_beat: string | null;
          name: string;
          notes: string | null;
        };
        Insert: {
          last_beat?: string | null;
          name: string;
          notes?: string | null;
        };
        Update: {
          last_beat?: string | null;
          name?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      inspections: {
        Row: {
          ai_summary: Json | null;
          completed_at: string | null;
          created_at: string;
          damage_detected: Json | null;
          id: string;
          inspection_date: string | null;
          inspection_type: Database["public"]["Enums"]["inspection_type"];
          inspector_id: string;
          lead_id: string;
          notes: string | null;
          status: Database["public"]["Enums"]["inspection_status"];
          updated_at: string;
          weather_conditions: string | null;
        };
        Insert: {
          ai_summary?: Json | null;
          completed_at?: string | null;
          created_at?: string;
          damage_detected?: Json | null;
          id?: string;
          inspection_date?: string | null;
          inspection_type?: Database["public"]["Enums"]["inspection_type"];
          inspector_id: string;
          lead_id: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["inspection_status"];
          updated_at?: string;
          weather_conditions?: string | null;
        };
        Update: {
          ai_summary?: Json | null;
          completed_at?: string | null;
          created_at?: string;
          damage_detected?: Json | null;
          id?: string;
          inspection_date?: string | null;
          inspection_type?: Database["public"]["Enums"]["inspection_type"];
          inspector_id?: string;
          lead_id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["inspection_status"];
          updated_at?: string;
          weather_conditions?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inspections_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inspections_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "v_funnel_leads";
            referencedColumns: ["lead_id"];
          },
        ];
      };
      invoices: {
        Row: {
          amount_cents: number;
          created_at: string | null;
          id: string;
          lead_id: string | null;
          org_id: string;
          report_id: string | null;
          status: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          org_id: string;
          report_id?: string | null;
          status?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          org_id?: string;
          report_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "v_funnel_leads";
            referencedColumns: ["lead_id"];
          },
          {
            foreignKeyName: "invoices_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
          {
            foreignKeyName: "invoices_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      je_assets: {
        Row: {
          attributes: Json | null;
          captured_at: string | null;
          ext_id: string | null;
          feature_type: string | null;
          geometry: Json;
          id: string;
          inserted_at: string | null;
          layer: string;
          lead_id: string | null;
          severity: string | null;
          source_version: string | null;
          updated_at: string | null;
        };
        Insert: {
          attributes?: Json | null;
          captured_at?: string | null;
          ext_id?: string | null;
          feature_type?: string | null;
          geometry: Json;
          id?: string;
          inserted_at?: string | null;
          layer: string;
          lead_id?: string | null;
          severity?: string | null;
          source_version?: string | null;
          updated_at?: string | null;
        };
        Update: {
          attributes?: Json | null;
          captured_at?: string | null;
          ext_id?: string | null;
          feature_type?: string | null;
          geometry?: Json;
          id?: string;
          inserted_at?: string | null;
          layer?: string;
          lead_id?: string | null;
          severity?: string | null;
          source_version?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "je_assets_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "je_assets_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "v_funnel_leads";
            referencedColumns: ["lead_id"];
          },
        ];
      };
      leads: {
        Row: {
          claim_number: string | null;
          client_email: string | null;
          client_name: string | null;
          client_phone: string | null;
          created_at: string;
          id: string;
          insurance_carrier: string | null;
          jurisdiction: string | null;
          latitude: number | null;
          lead_type: Database["public"]["Enums"]["lead_type"];
          longitude: number | null;
          org_id: string | null;
          parcel_id: string | null;
          policy_number: string | null;
          property_address: string;
          roof_material: string | null;
          roof_pitch: string | null;
          roof_size_sqft: number | null;
          status: Database["public"]["Enums"]["lead_status"];
          updated_at: string;
          userId: string;
        };
        Insert: {
          claim_number?: string | null;
          client_email?: string | null;
          client_name?: string | null;
          client_phone?: string | null;
          created_at?: string;
          id?: string;
          insurance_carrier?: string | null;
          jurisdiction?: string | null;
          latitude?: number | null;
          lead_type?: Database["public"]["Enums"]["lead_type"];
          longitude?: number | null;
          org_id?: string | null;
          parcel_id?: string | null;
          policy_number?: string | null;
          property_address: string;
          roof_material?: string | null;
          roof_pitch?: string | null;
          roof_size_sqft?: number | null;
          status?: Database["public"]["Enums"]["lead_status"];
          updated_at?: string;
          userId: string;
        };
        Update: {
          claim_number?: string | null;
          client_email?: string | null;
          client_name?: string | null;
          client_phone?: string | null;
          created_at?: string;
          id?: string;
          insurance_carrier?: string | null;
          jurisdiction?: string | null;
          latitude?: number | null;
          lead_type?: Database["public"]["Enums"]["lead_type"];
          longitude?: number | null;
          org_id?: string | null;
          parcel_id?: string | null;
          policy_number?: string | null;
          property_address?: string;
          roof_material?: string | null;
          roof_pitch?: string | null;
          roof_size_sqft?: number | null;
          status?: Database["public"]["Enums"]["lead_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
        ];
      };
      org_branding: {
        Row: {
          accent_color: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          claims_layout: string | null;
          company_name: string | null;
          country: string | null;
          email: string | null;
          logo_path: string | null;
          logo_url: string | null;
          org_id: string;
          phone: string | null;
          photo_layout: string | null;
          postal_code: string | null;
          primary_color: string | null;
          report_cover_style: string | null;
          secondary_color: string | null;
          state: string | null;
          theme_accent: string | null;
          theme_mode: string | null;
          theme_primary: string | null;
          theme_secondary: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          accent_color?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          claims_layout?: string | null;
          company_name?: string | null;
          country?: string | null;
          email?: string | null;
          logo_path?: string | null;
          logo_url?: string | null;
          org_id: string;
          phone?: string | null;
          photo_layout?: string | null;
          postal_code?: string | null;
          primary_color?: string | null;
          report_cover_style?: string | null;
          secondary_color?: string | null;
          state?: string | null;
          theme_accent?: string | null;
          theme_mode?: string | null;
          theme_primary?: string | null;
          theme_secondary?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          accent_color?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          claims_layout?: string | null;
          company_name?: string | null;
          country?: string | null;
          email?: string | null;
          logo_path?: string | null;
          logo_url?: string | null;
          org_id?: string;
          phone?: string | null;
          photo_layout?: string | null;
          postal_code?: string | null;
          primary_color?: string | null;
          report_cover_style?: string | null;
          secondary_color?: string | null;
          state?: string | null;
          theme_accent?: string | null;
          theme_mode?: string | null;
          theme_primary?: string | null;
          theme_secondary?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "org_branding_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_branding_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
        ];
      };
      org_defaults: {
        Row: {
          auto_detect: boolean;
          auto_pipeline_on_export: boolean;
          created_at: string | null;
          default_mode: string;
          default_photo_layout: number;
          from_email: string | null;
          from_name: string | null;
          org_id: string;
        };
        Insert: {
          auto_detect?: boolean;
          auto_pipeline_on_export?: boolean;
          created_at?: string | null;
          default_mode?: string;
          default_photo_layout?: number;
          from_email?: string | null;
          from_name?: string | null;
          org_id: string;
        };
        Update: {
          auto_detect?: boolean;
          auto_pipeline_on_export?: boolean;
          created_at?: string | null;
          default_mode?: string;
          default_photo_layout?: number;
          from_email?: string | null;
          from_name?: string | null;
          org_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_defaults_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_defaults_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
        ];
      };
      org_layouts: {
        Row: {
          org_id: string;
          preset_id: string;
          preset_json: Json;
          updated_at: string | null;
        };
        Insert: {
          org_id: string;
          preset_id?: string;
          preset_json?: Json;
          updated_at?: string | null;
        };
        Update: {
          org_id?: string;
          preset_id?: string;
          preset_json?: Json;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "org_layouts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_layouts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
        ];
      };
      org_settings: {
        Row: {
          branding: Json;
          created_at: string | null;
          id: string;
          org_slug: string;
          presets: Json;
          updated_at: string | null;
        };
        Insert: {
          branding?: Json;
          created_at?: string | null;
          id?: string;
          org_slug?: string;
          presets?: Json;
          updated_at?: string | null;
        };
        Update: {
          branding?: Json;
          created_at?: string | null;
          id?: string;
          org_slug?: string;
          presets?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      orgs: {
        Row: {
          address: string | null;
          address1: string | null;
          city: string | null;
          company_name: string | null;
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          name: string;
          owner_id: string;
          phone: string | null;
          postal: string | null;
          state: string | null;
          website: string | null;
          zip: string | null;
        };
        Insert: {
          address?: string | null;
          address1?: string | null;
          city?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          phone?: string | null;
          postal?: string | null;
          state?: string | null;
          website?: string | null;
          zip?: string | null;
        };
        Update: {
          address?: string | null;
          address1?: string | null;
          city?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          phone?: string | null;
          postal?: string | null;
          state?: string | null;
          website?: string | null;
          zip?: string | null;
        };
        Relationships: [];
      };
      photo_materials: {
        Row: {
          confidence: number;
          created_at: string | null;
          id: string;
          material: string;
          model: string | null;
          org_id: string;
          photo_id: string;
        };
        Insert: {
          confidence: number;
          created_at?: string | null;
          id?: string;
          material: string;
          model?: string | null;
          org_id: string;
          photo_id: string;
        };
        Update: {
          confidence?: number;
          created_at?: string | null;
          id?: string;
          material?: string;
          model?: string | null;
          org_id?: string;
          photo_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photo_materials_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photo_materials_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
          {
            foreignKeyName: "photo_materials_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          ai_caption: string | null;
          ai_tags: string[] | null;
          compass_bearing: number | null;
          created_at: string;
          damage_count: number | null;
          damage_severity: string | null;
          damage_types: Database["public"]["Enums"]["damage_type"][] | null;
          elevation: Database["public"]["Enums"]["elevation"] | null;
          file_path: string;
          file_size: number | null;
          file_url: string;
          id: string;
          inspection_id: string;
          is_featured: boolean | null;
          latitude: number | null;
          lead_id: string;
          longitude: number | null;
          manual_caption: string | null;
          manual_tags: string[] | null;
          mime_type: string | null;
          sort_order: number | null;
          stage: Database["public"]["Enums"]["photo_stage"] | null;
          uploaded_by: string;
        };
        Insert: {
          ai_caption?: string | null;
          ai_tags?: string[] | null;
          compass_bearing?: number | null;
          created_at?: string;
          damage_count?: number | null;
          damage_severity?: string | null;
          damage_types?: Database["public"]["Enums"]["damage_type"][] | null;
          elevation?: Database["public"]["Enums"]["elevation"] | null;
          file_path: string;
          file_size?: number | null;
          file_url: string;
          id?: string;
          inspection_id: string;
          is_featured?: boolean | null;
          latitude?: number | null;
          lead_id: string;
          longitude?: number | null;
          manual_caption?: string | null;
          manual_tags?: string[] | null;
          mime_type?: string | null;
          sort_order?: number | null;
          stage?: Database["public"]["Enums"]["photo_stage"] | null;
          uploaded_by: string;
        };
        Update: {
          ai_caption?: string | null;
          ai_tags?: string[] | null;
          compass_bearing?: number | null;
          created_at?: string;
          damage_count?: number | null;
          damage_severity?: string | null;
          damage_types?: Database["public"]["Enums"]["damage_type"][] | null;
          elevation?: Database["public"]["Enums"]["elevation"] | null;
          file_path?: string;
          file_size?: number | null;
          file_url?: string;
          id?: string;
          inspection_id?: string;
          is_featured?: boolean | null;
          latitude?: number | null;
          lead_id?: string;
          longitude?: number | null;
          manual_caption?: string | null;
          manual_tags?: string[] | null;
          mime_type?: string | null;
          sort_order?: number | null;
          stage?: Database["public"]["Enums"]["photo_stage"] | null;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "inspections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "v_funnel_leads";
            referencedColumns: ["lead_id"];
          },
        ];
      };
      policy_escalations: {
        Row: {
          auto_lock: boolean | null;
          channels: string[] | null;
          created_at: string;
          id: string;
          name: string;
          notify_roles: string[] | null;
          tenant_id: string | null;
          when_confidence: number | null;
          when_events: number | null;
        };
        Insert: {
          auto_lock?: boolean | null;
          channels?: string[] | null;
          created_at?: string;
          id?: string;
          name: string;
          notify_roles?: string[] | null;
          tenant_id?: string | null;
          when_confidence?: number | null;
          when_events?: number | null;
        };
        Update: {
          auto_lock?: boolean | null;
          channels?: string[] | null;
          created_at?: string;
          id?: string;
          name?: string;
          notify_roles?: string[] | null;
          tenant_id?: string | null;
          when_confidence?: number | null;
          when_events?: number | null;
        };
        Relationships: [];
      };
      policy_incident_actions: {
        Row: {
          action: string;
          comment: string | null;
          created_at: string;
          id: string;
          incident_id: string | null;
          userId: string | null;
        };
        Insert: {
          action: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          incident_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          incident_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "policy_incident_actions_incident_id_fkey";
            columns: ["incident_id"];
            isOneToOne: false;
            referencedRelation: "ai_incidents";
            referencedColumns: ["id"];
          },
        ];
      };
      policy_suppression_rules: {
        Row: {
          created_at: string;
          event_type: string | null;
          id: string;
          mute_until: string | null;
          reason: string | null;
          scope: Json | null;
          signature: string | null;
          tenant_id: string | null;
          threshold: number | null;
          window_sec: number | null;
        };
        Insert: {
          created_at?: string;
          event_type?: string | null;
          id?: string;
          mute_until?: string | null;
          reason?: string | null;
          scope?: Json | null;
          signature?: string | null;
          tenant_id?: string | null;
          threshold?: number | null;
          window_sec?: number | null;
        };
        Update: {
          created_at?: string;
          event_type?: string | null;
          id?: string;
          mute_until?: string | null;
          reason?: string | null;
          scope?: Json | null;
          signature?: string | null;
          tenant_id?: string | null;
          threshold?: number | null;
          window_sec?: number | null;
        };
        Relationships: [];
      };
      public_tokens: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          expires_at: string;
          id: string;
          max_views: number | null;
          report_id: string;
          revoked: boolean | null;
          scope: string;
          token: string;
          view_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          expires_at: string;
          id?: string;
          max_views?: number | null;
          report_id: string;
          revoked?: boolean | null;
          scope: string;
          token: string;
          view_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          expires_at?: string;
          id?: string;
          max_views?: number | null;
          report_id?: string;
          revoked?: boolean | null;
          scope?: string;
          token?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_tokens_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_tokens_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_audit_events: {
        Row: {
          actor: string | null;
          created_at: string | null;
          event_type: string;
          id: string;
          meta: Json | null;
          report_id: string;
        };
        Insert: {
          actor?: string | null;
          created_at?: string | null;
          event_type: string;
          id?: string;
          meta?: Json | null;
          report_id: string;
        };
        Update: {
          actor?: string | null;
          created_at?: string | null;
          event_type?: string;
          id?: string;
          meta?: Json | null;
          report_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_audit_events_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_audit_events_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_photos: {
        Row: {
          ai_boxes: Json | null;
          ai_labels: string[] | null;
          caption: string | null;
          caption_confidence: number | null;
          caption_source: string | null;
          created_at: string | null;
          id: string;
          report_id: string | null;
          sort_order: number | null;
          storage_path: string;
        };
        Insert: {
          ai_boxes?: Json | null;
          ai_labels?: string[] | null;
          caption?: string | null;
          caption_confidence?: number | null;
          caption_source?: string | null;
          created_at?: string | null;
          id?: string;
          report_id?: string | null;
          sort_order?: number | null;
          storage_path: string;
        };
        Update: {
          ai_boxes?: Json | null;
          ai_labels?: string[] | null;
          caption?: string | null;
          caption_confidence?: number | null;
          caption_source?: string | null;
          created_at?: string | null;
          id?: string;
          report_id?: string | null;
          sort_order?: number | null;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_photos_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_photos_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_price_approvals: {
        Row: {
          approver_email: string | null;
          approver_name: string;
          approver_type: string;
          created_at: string | null;
          id: string;
          initials_path: string | null;
          meta: Json | null;
          report_id: string;
          signature_path: string | null;
          version_no: number;
        };
        Insert: {
          approver_email?: string | null;
          approver_name: string;
          approver_type: string;
          created_at?: string | null;
          id?: string;
          initials_path?: string | null;
          meta?: Json | null;
          report_id: string;
          signature_path?: string | null;
          version_no: number;
        };
        Update: {
          approver_email?: string | null;
          approver_name?: string;
          approver_type?: string;
          created_at?: string | null;
          id?: string;
          initials_path?: string | null;
          meta?: Json | null;
          report_id?: string;
          signature_path?: string | null;
          version_no?: number;
        };
        Relationships: [
          {
            foreignKeyName: "report_price_approvals_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_price_approvals_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_price_versions: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: string;
          payload: Json;
          report_id: string;
          version_no: number;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          payload: Json;
          report_id: string;
          version_no: number;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          payload?: Json;
          report_id?: string;
          version_no?: number;
        };
        Relationships: [
          {
            foreignKeyName: "report_price_versions_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_price_versions_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_public_links: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          expires_at: string;
          id: string;
          report_id: string;
          token: string;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          expires_at?: string;
          id?: string;
          report_id: string;
          token: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          expires_at?: string;
          id?: string;
          report_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_public_links_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_public_links_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_signatures: {
        Row: {
          id: string;
          ip_address: string | null;
          report_id: string;
          signature_path: string;
          signed_at: string | null;
          signed_pdf_path: string | null;
          signer_email: string | null;
          signer_name: string;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          ip_address?: string | null;
          report_id: string;
          signature_path: string;
          signed_at?: string | null;
          signed_pdf_path?: string | null;
          signer_email?: string | null;
          signer_name: string;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          ip_address?: string | null;
          report_id?: string;
          signature_path?: string;
          signed_at?: string | null;
          signed_pdf_path?: string | null;
          signer_email?: string | null;
          signer_name?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "report_signatures_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_signatures_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          fields: Json;
          id: string;
          is_active: boolean | null;
          is_default: boolean | null;
          name: string;
          sections: Json;
          template_html: string | null;
          template_type: Database["public"]["Enums"]["report_template_type"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          fields?: Json;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          name: string;
          sections?: Json;
          template_html?: string | null;
          template_type: Database["public"]["Enums"]["report_template_type"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          fields?: Json;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          name?: string;
          sections?: Json;
          template_html?: string | null;
          template_type?: Database["public"]["Enums"]["report_template_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          acceptance: Json | null;
          created_at: string;
          created_by: string;
          esign: Json | null;
          id: string;
          inspection_id: string | null;
          is_client_visible: boolean | null;
          is_finalized: boolean | null;
          je_snapshot: Json | null;
          lead_id: string;
          org_id: string | null;
          payments: Json | null;
          pdf_path: string | null;
          pdf_url: string | null;
          report_data: Json;
          report_name: string;
          status: string | null;
          template_id: string;
          updated_at: string;
        };
        Insert: {
          acceptance?: Json | null;
          created_at?: string;
          created_by: string;
          esign?: Json | null;
          id?: string;
          inspection_id?: string | null;
          is_client_visible?: boolean | null;
          is_finalized?: boolean | null;
          je_snapshot?: Json | null;
          lead_id: string;
          org_id?: string | null;
          payments?: Json | null;
          pdf_path?: string | null;
          pdf_url?: string | null;
          report_data?: Json;
          report_name: string;
          status?: string | null;
          template_id: string;
          updated_at?: string;
        };
        Update: {
          acceptance?: Json | null;
          created_at?: string;
          created_by?: string;
          esign?: Json | null;
          id?: string;
          inspection_id?: string | null;
          is_client_visible?: boolean | null;
          is_finalized?: boolean | null;
          je_snapshot?: Json | null;
          lead_id?: string;
          org_id?: string | null;
          payments?: Json | null;
          pdf_path?: string | null;
          pdf_url?: string | null;
          report_data?: Json;
          report_name?: string;
          status?: string | null;
          template_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "inspections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "v_funnel_leads";
            referencedColumns: ["lead_id"];
          },
          {
            foreignKeyName: "reports_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
          {
            foreignKeyName: "reports_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "report_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      role_changes: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: string;
          new_role: Database["public"]["Enums"]["app_role"];
          old_role: Database["public"]["Enums"]["app_role"] | null;
          reason: string | null;
          target_user: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          new_role: Database["public"]["Enums"]["app_role"];
          old_role?: Database["public"]["Enums"]["app_role"] | null;
          reason?: string | null;
          target_user: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          new_role?: Database["public"]["Enums"]["app_role"];
          old_role?: Database["public"]["Enums"]["app_role"] | null;
          reason?: string | null;
          target_user?: string;
        };
        Relationships: [];
      };
      status_components: {
        Row: {
          id: string;
          name: string;
          status: string;
        };
        Insert: {
          id: string;
          name: string;
          status?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
        };
        Relationships: [];
      };
      status_incidents: {
        Row: {
          components: string[] | null;
          created_at: string | null;
          description: string | null;
          id: string;
          resolved_at: string | null;
          severity: string;
          started_at: string;
          title: string;
        };
        Insert: {
          components?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          resolved_at?: string | null;
          severity: string;
          started_at?: string;
          title: string;
        };
        Update: {
          components?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          resolved_at?: string | null;
          severity?: string;
          started_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      supplements: {
        Row: {
          created_at: string | null;
          id: string;
          items: Json;
          org_id: string;
          report_id: string;
          source: Json | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          items: Json;
          org_id: string;
          report_id: string;
          source?: Json | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          items?: Json;
          org_id?: string;
          report_id?: string;
          source?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "supplements_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplements_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
          {
            foreignKeyName: "supplements_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplements_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "v_client_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          created_at: string | null;
          full_name: string | null;
          org_id: string | null;
          userId: string;
        };
        Insert: {
          created_at?: string | null;
          full_name?: string | null;
          org_id?: string | null;
          userId: string;
        };
        Update: {
          created_at?: string | null;
          full_name?: string | null;
          org_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          userId: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          userId: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      weather_events: {
        Row: {
          address: string | null;
          created_at: string;
          data_source: string | null;
          event_date: string;
          event_type: string;
          hail_size_inches: number | null;
          id: string;
          latitude: number;
          longitude: number;
          severity: string | null;
          wind_speed_mph: number | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          data_source?: string | null;
          event_date: string;
          event_type: string;
          hail_size_inches?: number | null;
          id?: string;
          latitude: number;
          longitude: number;
          severity?: string | null;
          wind_speed_mph?: number | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          data_source?: string | null;
          event_date?: string;
          event_type?: string;
          hail_size_inches?: number | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          severity?: string | null;
          wind_speed_mph?: number | null;
        };
        Relationships: [];
      };
      webhook_status: {
        Row: {
          id: string;
          last_error: string | null;
          last_error_at: string | null;
          last_event_at: string | null;
          last_ok_at: string | null;
        };
        Insert: {
          id: string;
          last_error?: string | null;
          last_error_at?: string | null;
          last_event_at?: string | null;
          last_ok_at?: string | null;
        };
        Update: {
          id?: string;
          last_error?: string | null;
          last_error_at?: string | null;
          last_event_at?: string | null;
          last_ok_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      user_organizations: {
        Row: {
          created_at: string | null;
          org_id: string | null;
          userId: string | null;
        };
        Insert: {
          created_at?: never;
          org_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: never;
          org_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "v_branding_for_user";
            referencedColumns: ["org_id"];
          },
        ];
      };
      v_branding_for_user: {
        Row: {
          accent_color: string | null;
          address1: string | null;
          city: string | null;
          company_name: string | null;
          email: string | null;
          logo_url: string | null;
          org_id: string | null;
          phone: string | null;
          postal: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          state: string | null;
          theme_mode: string | null;
          userId: string | null;
          website: string | null;
        };
        Relationships: [];
      };
      v_client_reports: {
        Row: {
          address: string | null;
          approvals: Json | null;
          clientId: string | null;
          id: string | null;
          signed_pdf_path: string | null;
          status: string | null;
          title: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_report_assignments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      v_events_daily: {
        Row: {
          ai_actions: number | null;
          day: string | null;
          esigns: number | null;
          exports: number | null;
          payments: number | null;
          share_views: number | null;
          shares: number | null;
          tenant_id: string | null;
          userId: string | null;
        };
        Relationships: [];
      };
      v_funnel_leads: {
        Row: {
          approval_at: string | null;
          demo_at: string | null;
          did_approval: number | null;
          did_demo: number | null;
          did_report: number | null;
          lead_at: string | null;
          lead_id: string | null;
          owner_id: string | null;
          report_at: string | null;
        };
        Relationships: [];
      };
      v_ops_events: {
        Row: {
          day: string | null;
          id: string | null;
          kind: string | null;
        };
        Relationships: [];
      };
      v_report_funnel: {
        Row: {
          report_id: string | null;
          step_export: boolean | null;
          step_pay: boolean | null;
          step_share: boolean | null;
          step_sign: boolean | null;
          step_view: boolean | null;
          userId: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      crm_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      crm_metrics_v2: {
        Args: Record<PropertyKey, never>;
        Returns: {
          insurance_reports: number;
          total_photos: number;
          total_reports: number;
        }[];
      };
      crm_properties: {
        Args: Record<PropertyKey, never>;
        Returns: {
          address: string;
          id: string;
          lat: number;
          lon: number;
        }[];
      };
      current_org_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      ensure_current_org: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      grant_role: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _userId: string;
        };
        Returns: boolean;
      };
      increment_public_view: {
        Args: { _token: string };
        Returns: undefined;
      };
      onboarding_finalize_v2: {
        Args: {
          _address: string;
          _branding: Json;
          _defaults: Json;
          _name: string;
          _phone: string;
          _website: string;
        };
        Returns: {
          lead_id: string;
          org_id: string;
          report_id: string;
        }[];
      };
      revoke_role: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
      sign_report_url: {
        Args: { expires_in?: number; path: string };
        Returns: string;
      };
      upsert_org_branding: {
        Args: { _b: Json };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "owner" | "admin" | "estimator" | "inspector" | "viewer";
      damage_type: "hail" | "wind" | "ice" | "wear" | "leak" | "other";
      elevation: "north" | "south" | "east" | "west" | "front" | "back" | "left" | "right" | "roof";
      inspection_status: "in_progress" | "completed" | "cancelled";
      inspection_type: "ai_guided" | "instant_proposal" | "follow_up" | "drone_aerial";
      lead_status:
        | "new"
        | "contacted"
        | "scheduled"
        | "inspected"
        | "proposal_sent"
        | "won"
        | "lost";
      lead_type: "map_pin" | "manual" | "insurance" | "retail" | "recurring";
      photo_stage: "ground" | "roof" | "close_up" | "overview";
      report_template_type:
        | "retail_bid"
        | "insurance_claim"
        | "inspection_summary"
        | "storm_damage"
        | "completion"
        | "supplement_request"
        | "custom";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "estimator", "inspector", "viewer"],
      damage_type: ["hail", "wind", "ice", "wear", "leak", "other"],
      elevation: ["north", "south", "east", "west", "front", "back", "left", "right", "roof"],
      inspection_status: ["in_progress", "completed", "cancelled"],
      inspection_type: ["ai_guided", "instant_proposal", "follow_up", "drone_aerial"],
      lead_status: ["new", "contacted", "scheduled", "inspected", "proposal_sent", "won", "lost"],
      lead_type: ["map_pin", "manual", "insurance", "retail", "recurring"],
      photo_stage: ["ground", "roof", "close_up", "overview"],
      report_template_type: [
        "retail_bid",
        "insurance_claim",
        "inspection_summary",
        "storm_damage",
        "completion",
        "supplement_request",
        "custom",
      ],
    },
  },
} as const;
