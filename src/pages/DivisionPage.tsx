import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { DIVISIONS, DISTRICTS, fmtBn, intensityBucket, intensityLabel, slugify, timeAgoBn } from "@/lib/bd-data";
import { KPICard } from "@/components/KPICard";
import { Activity, Clock, MapPin, TrendingUp, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HourlyTrendChart } from "@/components/Charts";

interface Report {
  id: string;
  division: string;
  district: string;
  village: string | null;
  electricity_hours: number;
  outage_hours: number;
  comments: string | null;
  created_at: string;
}

const DivisionPage = () => {
  const { slug } = useParams();
  const division = DIVISIONS.find((d) => slugify(d) === slug);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!division) return;
    const load = async () => {
      const { data } = await supabase
        .from("outage_reports")
        .select("id,division,district,village,electricity_hours,outage_hours,comments,created_at")
        .eq("division", division)
        .order("created_at", { ascending: false })
        .limit(200);
      setReports((data as Report[]) ?? []);
      setLoading(false);
    };
    load();
  }, [division]);

  if (!division) {
    return (
      <div className="min-h-screen bg-surface">
        <SiteHeader />
        <main className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-2">বিভাগ পাওয়া যায়নি</h1>
          <Button asChild variant="outline" className="mt-4"><Link to="/map">ম্যাপে ফিরে যান</Link></Button>
        </main>
      </div>
    );
  }

  const total = reports.length;
  const totalOutage = reports.reduce((s, r) => s + Number(r.outage_hours), 0);
  const avgOutage = total ? totalOutage / total : 0;
  const avgElec = total ? reports.reduce((s, r) => s + Number(r.electricity_hours), 0) / total : 0;
  const intensity = intensityBucket(avgOutage);

  const districtMap = new Map<string, { sum: number; count: number }>();
  reports.forEach((r) => {
    const d = districtMap.get(r.district) || { sum: 0, count: 0 };
    d.sum += Number(r.outage_hours);
    d.count += 1;
    districtMap.set(r.district, d);
  });
  const districtRows = Array.from(districtMap.entries())
    .map(([district, v]) => ({ district, avg: v.sum / v.count, count: v.count }))
    .sort((a, b) => b.avg - a.avg);

  // Hourly trend
  const now = new Date();
  const buckets: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 24; i++) buckets[i] = { sum: 0, count: 0 };
  reports.forEach((x) => {
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

  return (
    <div className="min-h-screen bg-surface">
      <Helmet>
        <title>{`আজ ${division} বিভাগে কত ঘণ্টা লোডশেডিং — বিদ্যুৎ নজরদারি`}</title>
        <meta name="description" content={`${division} বিভাগের আজকের লোডশেডিং পরিস্থিতি, জেলা অনুযায়ী র‍্যাঙ্কিং ও সর্বশেষ রিপোর্ট।`} />
        <link rel="canonical" href={`/division/${slug}`} />
      </Helmet>
      <SiteHeader />
      <main className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
          <Link to="/map"><ArrowLeft className="h-4 w-4 mr-1" /> জাতীয় ম্যাপ</Link>
        </Button>

        <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="editorial-eyebrow">বিভাগ পেজ</div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-1">{division} বিভাগ</h1>
            <p className="text-sm text-muted-foreground mt-2">
              আজ এই বিভাগের পরিস্থিতি — <span className="font-semibold text-foreground">{intensityLabel(intensity)}</span>
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl border border-border/60 bg-card flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full" style={{ background: `hsl(var(--intensity-${intensity}))` }} />
            <span className="font-numeric font-bold text-lg">{fmtBn(avgOutage, 1)} ঘণ্টা</span>
            <span className="text-xs text-muted-foreground">গড় আউটেজ</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}</div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <KPICard icon={Activity} label="মোট রিপোর্ট" value={fmtBn(total)} tone="primary" />
              <KPICard icon={Clock} label="গড় বিদ্যুৎ প্রাপ্তি" value={`${fmtBn(avgElec, 1)} ঘ`} tone="accent" delay={0.05} />
              <KPICard icon={TrendingUp} label="গড় লোডশেডিং" value={`${fmtBn(avgOutage, 1)} ঘ`} tone="amber" delay={0.1} />
              <KPICard icon={MapPin} label="কভার করা জেলা" value={fmtBn(districtRows.length)} tone="primary" delay={0.15} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <HourlyTrendChart data={hourlyTrend} />

              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                <div className="editorial-eyebrow">জেলা র‍্যাঙ্কিং</div>
                <h3 className="font-display font-semibold text-base mt-0.5 mb-3">এই বিভাগের জেলাগুলো</h3>
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                  {districtRows.map((d, i) => {
                    const ib = intensityBucket(d.avg);
                    return (
                      <Link
                        key={d.district}
                        to={`/district/${slugify(d.district)}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-base group"
                      >
                        <div className="font-numeric font-bold text-muted-foreground w-5 text-xs">{fmtBn(i + 1)}</div>
                        <div className="h-2 w-2 rounded-full" style={{ background: `hsl(var(--intensity-${ib}))` }} />
                        <div className="flex-1 font-medium text-sm">{d.district}</div>
                        <div className="font-numeric font-bold text-sm">{fmtBn(d.avg, 1)} ঘ</div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-base" />
                      </Link>
                    );
                  })}
                  {districtRows.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">এই বিভাগে এখনও কোনো রিপোর্ট আসেনি</p>
                      <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/report">প্রথম রিপোর্টকারী হোন</Link></Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <h3 className="font-display font-semibold text-base mb-3">সর্বশেষ রিপোর্ট</h3>
              <div className="space-y-2">
                {reports.slice(0, 12).map((r) => (
                  <div key={r.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.district}{r.village && `, ${r.village}`}</div>
                      {r.comments && <p className="text-xs text-muted-foreground mt-0.5">{r.comments}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-numeric font-bold text-sm">{fmtBn(r.outage_hours, 1)} ঘ</div>
                      <div className="text-[10px] text-muted-foreground">{timeAgoBn(r.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default DivisionPage;
