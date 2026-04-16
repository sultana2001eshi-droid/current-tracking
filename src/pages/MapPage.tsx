import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BangladeshHeatmap } from "@/components/BangladeshHeatmap";
import { useDashboardData } from "@/components/DashboardSection";
import { intensityLabel, fmtBn, slugify } from "@/lib/bd-data";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const MapPage = () => {
  const { data, loading } = useDashboardData();

  return (
    <div className="min-h-screen bg-surface">
      <Helmet>
        <title>জাতীয় হিটম্যাপ — বাংলাদেশের লাইভ লোডশেডিং ম্যাপ</title>
        <meta name="description" content="বাংলাদেশের ৮টি বিভাগের লোডশেডিং তীব্রতা একটি হিটম্যাপে — কোন বিভাগে কতটা সমস্যা।" />
      </Helmet>
      <SiteHeader />
      <main className="container py-8 md:py-12">
        <div className="mb-8">
          <div className="editorial-eyebrow">ভিজ্যুয়াল</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">বাংলাদেশের জাতীয় লোডশেডিং হিটম্যাপ</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            ৮টি বিভাগের গড় লোডশেডিং ঘণ্টা অনুযায়ী রঙের তীব্রতা। বিভাগে ক্লিক করে বিস্তারিত দেখুন।
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-card border border-border/60 p-4 md:p-6 shadow-soft">
            {loading ? (
              <div className="h-[500px] shimmer rounded-2xl" />
            ) : (
              <BangladeshHeatmap data={data?.divisionStats ?? []} variant="page" />
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
              <div className="editorial-eyebrow">বিভাগ অনুযায়ী র‍্যাঙ্কিং</div>
              <h3 className="font-display font-semibold text-base mt-0.5 mb-3">গড় লোডশেডিং (বেশি থেকে কম)</h3>
              <div className="space-y-2">
                {(data?.divisionStats ?? [])
                  .sort((a, b) => b.avg_outage - a.avg_outage)
                  .map((d, i) => {
                    const intensity = d.avg_outage >= 10 ? 4 : d.avg_outage >= 7 ? 3 : d.avg_outage >= 4 ? 2 : d.avg_outage >= 2 ? 1 : 0;
                    return (
                      <Link
                        key={d.division}
                        to={`/division/${slugify(d.division)}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-base group"
                      >
                        <div className="font-numeric font-bold text-muted-foreground w-6 text-sm">{fmtBn(i + 1)}</div>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: `hsl(var(--intensity-${intensity}))` }} />
                        <div className="flex-1">
                          <div className="font-display font-semibold text-sm">{d.division}</div>
                          <div className="text-[11px] text-muted-foreground">{intensityLabel(intensity)} · {fmtBn(d.total_reports)} রিপোর্ট</div>
                        </div>
                        <div className="font-numeric font-bold text-sm">{fmtBn(d.avg_outage, 1)} ঘ</div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-base" />
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default MapPage;
