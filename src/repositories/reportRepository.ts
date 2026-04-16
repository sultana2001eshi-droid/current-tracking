// Report repository — abstracts Lovable Cloud (Supabase) persistence.
// All UI components should go through this layer.
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/bd-data";

export interface NewReport {
  division: string;
  district: string;
  upazila?: string | null;
  union_name?: string | null;
  village?: string | null;
  electricity_hours: number;
  outage_hours: number;
  outage_slots?: string | null;
  currently_on: boolean;
  low_voltage: boolean;
  transformer_issue: boolean;
  appliance_issue: boolean;
  comments?: string | null;
}

export const reportRepository = {
  async create(report: NewReport): Promise<{ error: string | null }> {
    const slug = [report.division, report.district, report.upazila, report.village]
      .filter(Boolean)
      .map((s) => slugify(s as string))
      .join("-");

    const { error } = await supabase.from("outage_reports").insert({
      division: report.division,
      district: report.district,
      upazila: report.upazila || null,
      union_name: report.union_name || null,
      village: report.village || null,
      electricity_hours: report.electricity_hours,
      outage_hours: report.outage_hours,
      outage_slots: report.outage_slots || null,
      currently_on: report.currently_on,
      low_voltage: report.low_voltage,
      transformer_issue: report.transformer_issue,
      appliance_issue: report.appliance_issue,
      comments: report.comments?.trim().slice(0, 500) || null,
      device_hash: slug.slice(0, 64),
      confidence_score: 0.9,
    });

    return { error: error?.message || null };
  },
};
