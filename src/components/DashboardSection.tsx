import { useEffect, useMemo, useState } from "react";
import { Activity, Clock, TrendingUp, MapPin, AlertTriangle, Award, Inbox } from "lucide-react";
import { KPICard } from "./KPICard";
import { fmtBn } from "@/lib/bd-data";
import { DivisionBarChart, HourlyTrendChart, TopDistrictsChart } from "./Charts";
import { LiveFeed } from "./LiveFeed";
import { dashboardRepository, type RawReport } from "@/repositories/dashboardRepository";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";

export type DashboardRange = "today" | "7d" | "30d" | "all" | "custom";
export interface CustomRange { from: Date; to: Date }

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

export const useDashboardData = (range: DashboardRange = "today") => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      const reports =
        range === "today"
          ? await dashboardRepository.todayReports()
          : await dashboardRepository.allTimeReports(5000);
      if (cancelled) return;
      const r = reports;

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

      const now = new Date();
      const buckets: Record<number, { sum: number; count: number }> = {};
      for (let i = 0; i < 24; i++) buckets[i] = { sum: 0, count: 0 };
      r.forEach((x) => {
        const t = new Date(x.created_at);
        const diffH = Math.floor((now.getTime() - t.getTime()) / 3_600_000);
        if (diffH < 24 && diffH >= 0) {
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

    setLoading(true);
    compute();
    const unsubscribe = dashboardRepository.subscribe(compute);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [range]);

  return { data, loading };
};

export const DashboardSection = () => {
  const [range, setRange] = useState<DashboardRange>("today");
  const { data, loading } = useDashboardData(range);

  const RangeToggle = (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/70 border border-border/60">
      {([
        { k: "today" as const, label: "আজকের ডাটা" },
        { k: "all" as const, label: "সর্বমোট ডাটা" },
      ]).map((opt) => {
        const active = range === opt.k;
        return (
          <button
            key={opt.k}
            type="button"
            onClick={() => setRange(opt.k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-base ${
              active
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  if (loading || !data) {
    return (
      <div className="container py-12 grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  const isToday = range === "today";
  const totalLabel = isToday ? "আজ মোট রিপোর্ট সংখ্যা" : "সর্বমোট রিপোর্ট সংখ্যা";
  const outageLabel = isToday ? "আজ মোট লোডশেডিং ঘণ্টা" : "সর্বমোট লোডশেডিং ঘণ্টা";
  const avgLabel = isToday ? "আজকের গড় লোডশেডিং" : "সর্বকালের গড় লোডশেডিং";

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="editorial-eyebrow">লাইভ জাতীয় ড্যাশবোর্ড</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">
            {isToday ? "আজকের পরিস্থিতি এক নজরে" : "সর্বমোট পরিস্থিতি এক নজরে"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            ডেটা বলুক কোথায় সবচেয়ে বেশি কষ্ট হচ্ছে — প্রতিটি সংখ্যা জনগণের রিপোর্ট থেকে।
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {RangeToggle}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20">
            <span className="h-2 w-2 rounded-full bg-success live-dot" />
            <span className="text-xs font-semibold">রিয়েলটাইম</span>
          </div>
        </div>
      </div>

      {data.totalReports === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 md:p-14 text-center">
          <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold mb-2">এখনও পর্যাপ্ত রিপোর্ট আসেনি</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            {isToday
              ? "আজ এখনও কোনো রিপোর্ট আসেনি। আপনার রিপোর্ট দিয়ে শুরু করুন — সর্বমোট ডেটাও দেখতে পারেন।"
              : "আপনার এলাকার রিপোর্ট দিয়ে জাতীয় ডেটা সমৃদ্ধ করুন। প্রথম রিপোর্ট আসা মাত্রই এখানে লাইভ পরিসংখ্যান দেখাবে।"}
          </p>
          <Button asChild className="bg-primary text-primary-foreground shadow-glow">
            <Link to="/report">প্রথম রিপোর্ট দিন →</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <KPICard icon={Activity} label={totalLabel} value={fmtBn(data.totalReports)} delay={0} tone="primary" />
            <KPICard icon={Clock} label={outageLabel} value={fmtBn(data.totalOutageHours, 0)} delay={0.05} tone="amber" />
            <KPICard icon={TrendingUp} label={avgLabel} value={`${fmtBn(data.avgOutage, 1)} ঘ`} delay={0.1} tone="accent" />
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
        </>
      )}
    </section>
  );
};
