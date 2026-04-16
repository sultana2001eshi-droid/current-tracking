-- Locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT,
  union_name TEXT,
  village TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_locations_division ON public.locations(division);
CREATE INDEX idx_locations_district ON public.locations(district);

-- Outage reports
CREATE TABLE public.outage_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT,
  union_name TEXT,
  village TEXT,
  electricity_hours NUMERIC(4,1) NOT NULL CHECK (electricity_hours >= 0 AND electricity_hours <= 24),
  outage_hours NUMERIC(4,1) NOT NULL CHECK (outage_hours >= 0 AND outage_hours <= 24),
  outage_slots TEXT,
  currently_on BOOLEAN DEFAULT true,
  low_voltage BOOLEAN DEFAULT false,
  transformer_issue BOOLEAN DEFAULT false,
  appliance_issue BOOLEAN DEFAULT false,
  comments TEXT,
  image_url TEXT,
  device_hash TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_division ON public.outage_reports(division);
CREATE INDEX idx_reports_district ON public.outage_reports(district);
CREATE INDEX idx_reports_date ON public.outage_reports(report_date DESC);
CREATE INDEX idx_reports_created ON public.outage_reports(created_at DESC);

-- Aggregated stats
CREATE TABLE public.aggregated_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division TEXT NOT NULL,
  district TEXT,
  avg_outage NUMERIC(4,2) DEFAULT 0,
  total_reports INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(division, district)
);

-- RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_stats ENABLE ROW LEVEL SECURITY;

-- Public read for everything (civic transparency)
CREATE POLICY "locations readable by all" ON public.locations FOR SELECT USING (true);
CREATE POLICY "reports readable by all" ON public.outage_reports FOR SELECT USING (true);
CREATE POLICY "stats readable by all" ON public.aggregated_stats FOR SELECT USING (true);

-- Anonymous report submission allowed (no phone/login required per spec)
CREATE POLICY "anyone can insert location" ON public.locations FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can insert report" ON public.outage_reports FOR INSERT WITH CHECK (
  electricity_hours + outage_hours <= 24
  AND length(coalesce(comments, '')) <= 500
  AND length(division) <= 50
  AND length(district) <= 50
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.outage_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aggregated_stats;