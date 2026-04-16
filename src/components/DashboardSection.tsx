import { useEffect, useState } from "react";
import { Activity, Clock, TrendingUp, MapPin, AlertTriangle, Award, Inbox } from "lucide-react";
import { KPICard } from "./KPICard";
import { fmtBn } from "@/lib/bd-data";
import { DivisionBarChart, HourlyTrendChart, TopDistrictsChart } from "./Charts";
import { LiveFeed } from "./LiveFeed";
import { dashboardRepository, type RawReport } from "@/repositories/dashboardRepository";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Report = RawReport;

interface DashboardData {
  totalReports: number;
  totalOutageHours: number;
  avgOutage: number;
  worstDivision: string;
  worstDistrict: string;
  worstVillage: string;
  divisionStats: { division: string; avg_outage: number; total_reports: number }[];
  districtStats: { district: string; avg_outage: number }[];
  hourlyTrend: { hour: string; outage: number }[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const compute = async () => {
      const { data: reports } = await supabase
        .from("outage_reports")
        .select("id,division,district,village,electricity_hours,outage_hours,created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!reports) {
        setLoading(false);
        return;
      }

      const r = reports as Report[];

      const totalReports = r.length;
      const totalOutageHours = r.reduce((s, x) => s + Number(x.outage_hours), 0);
      const avgOutage = totalReports ? totalOutageHours / totalReports : 0;

      const divMap = new Map<string, { sum: number; count: number }>();
      const distMap = new Map<string, { sum: number; count: number }>();
      const villageMap = new Map<string, { sum: number; count: number; village: string }>();

      r.forEach((x) => {
        const dv = divMap.get(x.division) || { sum: 0, count: 0 };
        dv.sum += Number(x.outage_hours);
        dv.count += 1;
        divMap.set(x.division, dv);

        const dt = distMap.get(x.district) || { sum: 0, count: 0 };
        dt.sum += Number(x.outage_hours);
        dt.count += 1;
        distMap.set(x.district, dt);

        if (x.village) {
          const v = villageMap.get(x.village) || { sum: 0, count: 0, village: x.village };
          v.sum += Number(x.outage_hours);
          v.count += 1;
          villageMap.set(x.village, v);
        }
      });

      const divisionStats = Array.from(divMap.entries()).map(([division, v]) => ({
        division,
        avg_outage: v.sum / v.count,
        total_reports: v.count,
      }));
      const districtStats = Array.from(distMap.entries()).map(([district, v]) => ({
        district,
        avg_outage: v.sum / v.count,
      }));

      const worstDivision = [...divisionStats].sort((a, b) => b.avg_outage - a.avg_outage)[0]?.division || "—";
      const worstDistrict = [...districtStats].sort((a, b) => b.avg_outage - a.avg_outage)[0]?.district || "—";
      const worstVillage = Array.from(villageMap.values()).sort((a, b) => b.sum / b.count - a.sum / a.count)[0]?.village || "—";

      // Hourly trend (last 24h)
      const now = new Date();
      const buckets: Record<number, { sum: number; count: number }> = {};
      for (let i = 0; i < 24; i++) buckets[i] = { sum: 0, count: 0 };
      r.forEach((x) => {
        const t = new Date(x.created_at);
        const diffH = Math.floor((now.getTime() - t.getTime()) / 3_600_000);
        if (diffH < 24) {
          const slot = 23 - diffH;
          buckets[slot].sum += Number(x.outage_hours);
          buckets[slot].count += 1;
        }
      });
      const hourlyTrend = Object.entries(buckets).map(([h, v]) => ({
        hour: String(h),
        outage: v.count ? v.sum / v.count : 0,
      }));

      setData({
        totalReports,
        totalOutageHours,
        avgOutage,
        worstDivision,
        worstDistrict,
        worstVillage,
        divisionStats,
        districtStats,
        hourlyTrend,
      });
      setLoading(false);
    };

    compute();

    const channel = supabase
      .channel(`dashboard-realtime-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outage_reports" },
        () => compute()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading };
};

export const DashboardSection = () => {
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <div className="container py-12 grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="editorial-eyebrow">লাইভ জাতীয় ড্যাশবোর্ড</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">আজকের পরিস্থিতি এক নজরে</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            ডেটা বলুক কোথায় সবচেয়ে বেশি কষ্ট হচ্ছে — প্রতিটি সংখ্যা জনগণের রিপোর্ট থেকে।
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20">
          <span className="h-2 w-2 rounded-full bg-success live-dot" />
          <span className="text-xs font-semibold">রিয়েলটাইম আপডেট</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <KPICard icon={Activity} label="আজ মোট রিপোর্ট সংখ্যা" value={fmtBn(data.totalReports)} delay={0} tone="primary" />
        <KPICard icon={Clock} label="আজ মোট লোডশেডিং ঘণ্টা" value={fmtBn(data.totalOutageHours, 0)} delay={0.05} tone="amber" />
        <KPICard icon={TrendingUp} label="সারাদেশে গড় লোডশেডিং" value={`${fmtBn(data.avgOutage, 1)} ঘ`} delay={0.1} tone="accent" />
        <KPICard icon={AlertTriangle} label="সবচেয়ে ক্ষতিগ্রস্ত বিভাগ" value={data.worstDivision} delay={0.15} tone="destructive" />
        <KPICard icon={MapPin} label="সবচেয়ে ক্ষতিগ্রস্ত জেলা" value={data.worstDistrict} delay={0.2} tone="destructive" />
        <KPICard icon={Award} label="সবচেয়ে কম বিদ্যুৎ পাওয়া গ্রাম" value={data.worstVillage} delay={0.25} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4">
          <DivisionBarChart data={data.divisionStats} />
          <div className="grid gap-4 md:grid-cols-2">
            <HourlyTrendChart data={data.hourlyTrend} />
            <TopDistrictsChart data={data.districtStats} />
          </div>
        </div>
        <LiveFeed />
      </div>
    </section>
  );
};
