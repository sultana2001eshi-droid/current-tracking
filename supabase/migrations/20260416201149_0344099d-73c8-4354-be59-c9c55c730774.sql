-- Function to refresh aggregated_stats for a given division/district pair
CREATE OR REPLACE FUNCTION public.refresh_aggregated_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  div_avg NUMERIC;
  div_total INTEGER;
  dist_avg NUMERIC;
  dist_total INTEGER;
BEGIN
  -- Division-level aggregate (district IS NULL row)
  SELECT COALESCE(AVG(outage_hours), 0)::NUMERIC, COUNT(*)::INTEGER
    INTO div_avg, div_total
  FROM public.outage_reports
  WHERE division = NEW.division;

  -- Upsert division-level row (district IS NULL)
  IF EXISTS (
    SELECT 1 FROM public.aggregated_stats
    WHERE division = NEW.division AND district IS NULL
  ) THEN
    UPDATE public.aggregated_stats
       SET avg_outage = div_avg,
           total_reports = div_total,
           updated_at = now()
     WHERE division = NEW.division AND district IS NULL;
  ELSE
    INSERT INTO public.aggregated_stats (division, district, avg_outage, total_reports, updated_at)
    VALUES (NEW.division, NULL, div_avg, div_total, now());
  END IF;

  -- District-level aggregate
  IF NEW.district IS NOT NULL AND length(NEW.district) > 0 THEN
    SELECT COALESCE(AVG(outage_hours), 0)::NUMERIC, COUNT(*)::INTEGER
      INTO dist_avg, dist_total
    FROM public.outage_reports
    WHERE division = NEW.division AND district = NEW.district;

    IF EXISTS (
      SELECT 1 FROM public.aggregated_stats
      WHERE division = NEW.division AND district = NEW.district
    ) THEN
      UPDATE public.aggregated_stats
         SET avg_outage = dist_avg,
             total_reports = dist_total,
             updated_at = now()
       WHERE division = NEW.division AND district = NEW.district;
    ELSE
      INSERT INTO public.aggregated_stats (division, district, avg_outage, total_reports, updated_at)
      VALUES (NEW.division, NEW.district, dist_avg, dist_total, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_refresh_aggregated_stats ON public.outage_reports;

CREATE TRIGGER trg_refresh_aggregated_stats
AFTER INSERT ON public.outage_reports
FOR EACH ROW
EXECUTE FUNCTION public.refresh_aggregated_stats();

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_aggregated_stats_division_district
  ON public.aggregated_stats (division, district);
