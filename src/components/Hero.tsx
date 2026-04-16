import { Link } from "react-router-dom";
import { ArrowRight, Activity, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BangladeshHeatmap } from "./BangladeshHeatmap";
import { motion } from "framer-motion";
import { fmtBn } from "@/lib/bd-data";

interface HeroProps {
  totalReports: number;
  avgOutage: number;
}

export const Hero = ({ totalReports, avgOutage }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-hero text-primary-foreground">
      <div className="absolute inset-0 grain opacity-40" aria-hidden />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" aria-hidden />

      <div className="container relative py-14 md:py-20 lg:py-24 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 backdrop-blur-sm mb-5">
            <span className="h-2 w-2 rounded-full bg-secondary live-dot" />
            <span className="text-xs font-semibold tracking-wide">লাইভ — এখন রিপোর্ট আসছে</span>
          </div>

          <h1 className="font-display text-[34px] sm:text-5xl lg:text-[58px] leading-[1.1] font-bold mb-5">
            আজ বাংলাদেশে কোথায়
            <br />
            <span className="bg-amber bg-clip-text text-transparent">কতক্ষণ লোডশেডিং?</span>
          </h1>

          <p className="text-base md:text-lg text-primary-foreground/85 max-w-xl leading-relaxed mb-7">
            জনগণের রিপোর্টে তৈরি দেশের সবচেয়ে বড় বিদ্যুৎ পরিস্থিতি ম্যাপ। 
            <span className="font-semibold"> আপনার গ্রামের কথাও এখানে গুরুত্বপূর্ণ।</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-amber text-secondary-foreground shadow-amber hover:opacity-95 font-semibold h-12 px-6 rounded-2xl">
              <Link to="/report">
                আপনার এলাকার রিপোর্ট দিন
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-primary-foreground/5 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground h-12 px-6 rounded-2xl">
              <Link to="/dashboard">লাইভ ড্যাশবোর্ড</Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: Activity, label: "মোট রিপোর্ট", value: fmtBn(totalReports) },
              { icon: MapPin, label: "জেলা কভার", value: fmtBn(40) + "+" },
              { icon: Sparkles, label: "গড় লোডশেডিং", value: fmtBn(avgOutage, 1) + "ঘ" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-primary-foreground/8 border border-primary-foreground/12 backdrop-blur-sm p-3">
                <s.icon className="h-4 w-4 text-secondary mb-1.5" />
                <div className="font-numeric text-xl font-bold">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-primary-foreground/65 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="relative rounded-3xl bg-primary-foreground/8 border border-primary-foreground/15 p-5 backdrop-blur-md shadow-elegant">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-primary-foreground/65">এই মুহূর্তের পরিস্থিতি</div>
                <div className="font-display font-semibold text-sm">বিভাগ অনুযায়ী লোডশেডিং তীব্রতা</div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-primary-foreground/75">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary live-dot" /> লাইভ
              </div>
            </div>
            <BangladeshHeatmap variant="hero" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
