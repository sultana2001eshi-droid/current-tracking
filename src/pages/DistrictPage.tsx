import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { DISTRICTS, DIVISIONS, fmtBn, intensityBucket, intensityLabel, slugify, timeAgoBn } from "@/lib/bd-data";
import { KPICard } from "@/components/KPICard";
import { Activity, Clock, TrendingUp, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HourlyTrendChart } from "@/components/Charts";

interface Report {
  id: string;
  district: string;
  upazila: string | null;
  village: string | null;
  electricity_hours: number;
  outage_hours: number;
  comments: string | null;
  created_at: string;
}

const DistrictPage = () => {
  const { slug } = useParams();
  // find district + division
  let foundDist: string | null = null;
  let foundDiv: string | null = null;
  for (const div of DIVISIONS) {
    const m = DISTRICTS[div].find((d) => slugify(d) === slug);
    if (m) {
      foundDist = m;
      foundDiv = div;
      break;
    }
  }

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!foundDist) return;
    const load = async () => {
      const { data } = await supabase
        .from("outage_reports")
        .select("id,district,upazila,village,electricity_hours,outage_hours,comments,created_at")
        .eq("district", foundDist!)
        .order("created_at", { ascending: false })
        .limit(200);
      setReports((data as Report[]) ?? []);
      setLoading(false);
    };
    load();
  }, [foundDist]);

  if (!foundDist || !foundDiv) {
    return (
      <div className="min-h-screen bg-surface">
        <SiteHeader />
        <main className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-2">জেলা পাওয়া যায়নি</h1>
          <Button asChild variant="outline" className="mt-4"><Link to="/map">ম্যাপে ফিরে যান</Link></Button>
        </main>
      </div>
    );
  }

  const total = reports.length;
  const avgOutage = total ? reports.reduce((s, r) => s + Number(r.outage_hours), 0) / total : 0;
  const avgElec = total ? reports.reduce((s, r) => s + Number(r.electricity_hours), 0) / total : 0;
  const intensity = intensityBucket(avgOutage);

  const villageMap = new Map<string, { sum: number; count: number }>();
  reports.forEach((r) => {
    if (!r.village) return;
    const v = villageMap.get(r.village) || { sum: 0, count: 0 };
    v.sum += Number(r.outage_hours);
    v.count += 1;
    villageMap.set(r.village, v);
  });
  const villages = Array.from(villageMap.entries())
    .map(([village, v]) => ({ village, avg: v.sum / v.count, count: v.count }))
    .sort((a, b) => b.avg - a.avg);

  const now = new Date();
  const buckets: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 24; i++) buckets[i] = { sum: 0, count: 0 };
  reports.forEach((x) => {
    const diffH = Math.floor((now.getTime() - new Date(x.created_at).getTime()) / 3_600_000);
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
        <title>{`আজ ${foundDist} জেলায় কত ঘণ্টা লোডশেডিং — বিদ্যুৎ নজরদারি`}</title>
        <meta name="description" content={`${foundDist} জেলার আজকের বিদ্যুৎ পরিস্থিতি, গ্রাম অনুযায়ী র‍্যাঙ্কিং ও সর্বশেষ রিপোর্ট।`} />
        <link rel="canonical" href={`/district/${slug}`} />
      </Helmet>
      <SiteHeader />
      <main className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
          <Link to={`/division/${slugify(foundDiv)}`}><ArrowLeft className="h-4 w-4 mr-1" /> {foundDiv} বিভাগ</Link>
        </Button>

        <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="editorial-eyebrow">{foundDiv} বিভাগ</div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-1">{foundDist}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              আজকের পরিস্থিতি — <span className="font-semibold text-foreground">{intensityLabel(intensity)}</span>
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl border border-border/60 bg-card flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full" style={{ background: `hsl(var(--intensity-${intensity}))` }} />
            <span className="font-numeric font-bold text-lg">{fmtBn(avgOutage, 1)} ঘণ্টা</span>
            <span className="text-xs text-muted-foreground">গড়</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}</div>
        ) : total === 0 ? (
          <div className="rounded-3xl bg-card border border-border/60 p-12 text-center shadow-soft">
            <h2 className="font-display text-xl font-bold mb-2">এলাকাটিতে এখনও কোনো রিপোর্ট আসেনি</h2>
            <p className="text-muted-foreground mb-5">আপনিই প্রথম রিপোর্টকারী হতে পারেন।</p>
            <Button asChild className="bg-amber text-secondary-foreground shadow-amber"><Link to="/report">এখনই রিপোর্ট দিন</Link></Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <KPICard icon={Activity} label="মোট রিপোর্ট" value={fmtBn(total)} tone="primary" />
              <KPICard icon={Clock} label="গড় বিদ্যুৎ প্রাপ্তি" value={`${fmtBn(avgElec, 1)} ঘ`} tone="accent" delay={0.05} />
              <KPICard icon={TrendingUp} label="গড় লোডশেডিং" value={`${fmtBn(avgOutage, 1)} ঘ`} tone="amber" delay={0.1} />
              <KPICard icon={MapPin} label="কভার করা গ্রাম" value={fmtBn(villages.length)} tone="primary" delay={0.15} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <HourlyTrendChart data={hourlyTrend} />

              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                <div className="editorial-eyebrow">গ্রাম র‍্যাঙ্কিং</div>
                <h3 className="font-display font-semibold text-base mt-0.5 mb-3">শীর্ষ ক্ষতিগ্রস্ত গ্রাম</h3>
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                  {villages.length === 0 && <p className="text-sm text-muted-foreground">গ্রামভিত্তিক রিপোর্ট নেই</p>}
                  {villages.map((v, i) => {
                    const ib = intensityBucket(v.avg);
                    return (
                      <div key={v.village} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-base">
                        <div className="font-numeric font-bold text-muted-foreground w-5 text-xs">{fmtBn(i + 1)}</div>
                        <div className="h-2 w-2 rounded-full" style={{ background: `hsl(var(--intensity-${ib}))` }} />
                        <div className="flex-1 font-medium text-sm">{v.village}</div>
                        <div className="text-[10px] text-muted-foreground">{fmtBn(v.count)} রিপোর্ট</div>
                        <div className="font-numeric font-bold text-sm">{fmtBn(v.avg, 1)} ঘ</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <h3 className="font-display font-semibold text-base mb-3">সর্বশেষ রিপোর্ট</h3>
              <div className="space-y-2">
                {reports.slice(0, 15).map((r) => (
                  <div key={r.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{[r.village, r.upazila].filter(Boolean).join(", ") || "—"}</div>
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

export default DistrictPage;
