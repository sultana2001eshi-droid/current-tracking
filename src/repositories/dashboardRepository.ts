// Dashboard repository — reads aggregated outage data.
// Switch implementation here to move off Supabase later.
import { supabase } from "@/integrations/supabase/client";

export interface RawReport {
  id: string;
  division: string;
  district: string;
  village: string | null;
  electricity_hours: number;
  outage_hours: number;
  created_at: string;
}

export const dashboardRepository = {
  async recentReports(limit = 500): Promise<RawReport[]> {
    const { data } = await supabase
      .from("outage_reports")
      .select("id,division,district,village,electricity_hours,outage_hours,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as RawReport[]) || [];
  },

  subscribe(onChange: () => void) {
    const channel = supabase
      .channel(`reports-realtime-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outage_reports" },
        () => onChange()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
