-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for type safety
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'estimator', 'inspector', 'viewer');
CREATE TYPE public.lead_type AS ENUM ('map_pin', 'manual', 'insurance', 'retail', 'recurring');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'scheduled', 'inspected', 'proposal_sent', 'won', 'lost');
CREATE TYPE public.inspection_type AS ENUM ('ai_guided', 'instant_proposal', 'follow_up', 'drone_aerial');
CREATE TYPE public.inspection_status AS ENUM ('in_progress', 'completed', 'cancelled');
CREATE TYPE public.damage_type AS ENUM ('hail', 'wind', 'ice', 'wear', 'leak', 'other');
CREATE TYPE public.elevation AS ENUM ('north', 'south', 'east', 'west', 'front', 'back', 'left', 'right', 'roof');
CREATE TYPE public.photo_stage AS ENUM ('ground', 'roof', 'close_up', 'overview');
CREATE TYPE public.report_template_type AS ENUM ('retail_bid', 'insurance_claim', 'inspection_summary', 'storm_damage', 'completion', 'supplement_request', 'custom');

-- User Roles Table (CRITICAL: Separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Leads Table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_type lead_type NOT NULL DEFAULT 'manual',
  status lead_status NOT NULL DEFAULT 'new',
  
  -- Client info
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  
  -- Property info
  property_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  jurisdiction TEXT,
  parcel_id TEXT,
  
  -- Roof details
  roof_size_sqft INTEGER,
  roof_pitch TEXT,
  roof_material TEXT,
  
  -- Insurance info
  insurance_carrier TEXT,
  policy_number TEXT,
  claim_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Inspections Table
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  inspection_type inspection_type NOT NULL DEFAULT 'ai_guided',
  status inspection_status NOT NULL DEFAULT 'in_progress',
  
  -- Inspection details
  inspection_date TIMESTAMPTZ,
  weather_conditions TEXT,
  notes TEXT,
  
  -- AI analysis summary
  ai_summary JSONB,
  damage_detected JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_inspections_lead_id ON public.inspections(lead_id);
CREATE INDEX idx_inspections_inspector_id ON public.inspections(inspector_id);
CREATE INDEX idx_inspections_status ON public.inspections(status);

-- Photos/Media Table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File info
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Location metadata
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  compass_bearing INTEGER, -- 0-359 degrees
  elevation elevation,
  stage photo_stage,
  
  -- AI analysis
  ai_caption TEXT,
  ai_tags TEXT[],
  damage_types damage_type[],
  damage_count INTEGER DEFAULT 0,
  damage_severity TEXT,
  
  -- Manual overrides
  manual_caption TEXT,
  manual_tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_photos_inspection_id ON public.photos(inspection_id);
CREATE INDEX idx_photos_lead_id ON public.photos(lead_id);
CREATE INDEX idx_photos_elevation ON public.photos(elevation);
CREATE INDEX idx_photos_stage ON public.photos(stage);
CREATE INDEX idx_photos_ai_tags ON public.photos USING GIN(ai_tags);

-- Report Templates Table
CREATE TABLE public.report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  template_type report_template_type NOT NULL,
  description TEXT,
  
  -- Template structure
  sections JSONB NOT NULL DEFAULT '[]',
  fields JSONB NOT NULL DEFAULT '{}',
  
  -- Template file (HTML/PDF)
  template_html TEXT,
  
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_report_templates_type ON public.report_templates(template_type);

-- Reports Table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE RESTRICT,
  
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report details
  report_name TEXT NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  
  -- Generated files
  pdf_url TEXT,
  pdf_path TEXT,
  
  -- Status
  is_finalized BOOLEAN DEFAULT false,
  is_client_visible BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reports_lead_id ON public.reports(lead_id);
CREATE INDEX idx_reports_inspection_id ON public.reports(inspection_id);
CREATE INDEX idx_reports_created_by ON public.reports(created_by);

-- Code Compliance Cache Table
CREATE TABLE public.code_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction TEXT NOT NULL,
  zip_code TEXT,
  
  -- Code requirements
  requirements JSONB NOT NULL DEFAULT '{}',
  
  -- Cache metadata
  source TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(jurisdiction, zip_code)
);

ALTER TABLE public.code_compliance ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_code_compliance_jurisdiction ON public.code_compliance(jurisdiction);
CREATE INDEX idx_code_compliance_zip ON public.code_compliance(zip_code);

-- Weather Events Table
CREATE TABLE public.weather_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'hail', 'wind', 'tornado', etc.
  event_date DATE NOT NULL,
  severity TEXT,
  
  -- Hail specific
  hail_size_inches DECIMAL(4, 2),
  
  -- Wind specific
  wind_speed_mph INTEGER,
  
  -- Metadata
  data_source TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.weather_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_weather_events_location ON public.weather_events(latitude, longitude);
CREATE INDEX idx_weather_events_date ON public.weather_events(event_date DESC);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- RLS Policies for leads
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners and admins can view all leads"
  ON public.leads FOR SELECT
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for inspections
CREATE POLICY "Inspectors can view their inspections"
  ON public.inspections FOR SELECT
  USING (
    auth.uid() = inspector_id OR 
    EXISTS (SELECT 1 FROM public.leads WHERE id = inspections.lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Inspectors can create inspections"
  ON public.inspections FOR INSERT
  WITH CHECK (auth.uid() = inspector_id);

CREATE POLICY "Inspectors can update their inspections"
  ON public.inspections FOR UPDATE
  USING (auth.uid() = inspector_id);

-- RLS Policies for photos
CREATE POLICY "Users can view photos from their leads"
  ON public.photos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = photos.lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can upload photos"
  ON public.photos FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their photos"
  ON public.photos FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- RLS Policies for templates
CREATE POLICY "Anyone authenticated can view active templates"
  ON public.report_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners and admins can manage templates"
  ON public.report_templates FOR ALL
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reports
CREATE POLICY "Users can view reports for their leads"
  ON public.reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = reports.lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for code_compliance (read-only for all authenticated)
CREATE POLICY "Authenticated users can view code compliance"
  ON public.code_compliance FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for weather_events (read-only for all authenticated)
CREATE POLICY "Authenticated users can view weather events"
  ON public.weather_events FOR SELECT
  TO authenticated
  USING (true);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();