import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fmtBn, timeAgoBn } from "@/lib/bd-data";
import { Zap, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedItem {
  id: string;
  division: string;
  district: string;
  village: string | null;
  outage_hours: number;
  created_at: string;
}

export const LiveFeed = () => {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("outage_reports")
        .select("id,division,district,village,outage_hours,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (data) setItems(data as FeedItem[]);
    };
    load();

    const channel = supabase
      .channel("live-reports")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outage_reports" },
        (payload) => {
          setItems((prev) => [payload.new as FeedItem, ...prev].slice(0, 8));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-soft">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card-grad">
        <div>
          <div className="editorial-eyebrow">লাইভ ফিড</div>
          <h3 className="font-display font-semibold text-base mt-0.5">এই মুহূর্তের রিপোর্ট</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-destructive live-dot" />
          লাইভ
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const severe = item.outage_hours >= 8;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="px-5 py-3.5 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-base"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${severe ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                    {severe ? <AlertTriangle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-snug">
                      <span className="font-semibold text-foreground">{item.district}</span>
                      {item.village && <span className="text-muted-foreground">, {item.village}</span>}
                      <span className="text-muted-foreground"> ({item.division})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-numeric font-semibold ${severe ? "text-destructive" : "text-foreground"}`}>
                        {fmtBn(item.outage_hours, 1)} ঘণ্টা লোডশেডিং
                      </span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgoBn(item.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="text-sm text-muted-foreground">এখনও কোনো রিপোর্ট আসেনি</div>
            <div className="text-xs text-muted-foreground/70 mt-1">আপনিই প্রথম রিপোর্টকারী হতে পারেন</div>
          </div>
        )}
      </div>
    </div>
  );
};
