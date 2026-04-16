import { useMemo } from "react";
import { Link } from "react-router-dom";
import { intensityBucket, intensityLabel, fmtBn, slugify } from "@/lib/bd-data";

interface DivisionStat {
  division: string;
  avg_outage: number;
  total_reports: number;
}

// Approximated Bangladesh division shapes — stylized blocky paths for premium handcrafted look.
// Each path is a hand-tuned region positioned in a 800x900 viewbox.
const DIVISION_SHAPES: Record<string, { d: string; cx: number; cy: number }> = {
  "রংপুর": {
    d: "M 240 80 L 360 60 L 410 130 L 380 200 L 290 230 L 220 200 L 200 130 Z",
    cx: 300, cy: 145,
  },
  "ময়মনসিংহ": {
    d: "M 380 200 L 470 200 L 510 290 L 460 360 L 380 350 L 340 280 Z",
    cx: 420, cy: 280,
  },
  "রাজশাহী": {
    d: "M 200 130 L 290 230 L 280 320 L 220 380 L 130 370 L 80 280 L 100 180 Z",
    cx: 180, cy: 260,
  },
  "ঢাকা": {
    d: "M 280 320 L 380 350 L 420 430 L 380 510 L 290 520 L 240 450 L 240 380 Z",
    cx: 320, cy: 430,
  },
  "সিলেট": {
    d: "M 460 360 L 560 320 L 640 350 L 660 440 L 580 470 L 510 450 L 460 410 Z",
    cx: 560, cy: 395,
  },
  "খুলনা": {
    d: "M 130 370 L 220 380 L 240 450 L 230 560 L 180 660 L 110 670 L 60 580 L 70 470 Z",
    cx: 150, cy: 510,
  },
  "বরিশাল": {
    d: "M 230 560 L 290 520 L 380 510 L 400 600 L 360 690 L 280 720 L 220 680 Z",
    cx: 300, cy: 615,
  },
  "চট্টগ্রাম": {
    d: "M 380 510 L 510 450 L 580 470 L 600 580 L 580 700 L 520 800 L 440 820 L 400 750 L 380 650 Z",
    cx: 490, cy: 640,
  },
};

interface Props {
  data?: DivisionStat[];
  variant?: "hero" | "page";
}

export const BangladeshHeatmap = ({ data = [], variant = "page" }: Props) => {
  const byDiv = useMemo(() => {
    const m = new Map<string, DivisionStat>();
    data.forEach((d) => m.set(d.division, d));
    return m;
  }, [data]);

  const colorFor = (div: string): string => {
    const stat = byDiv.get(div);
    if (!stat) return "hsl(var(--intensity-0))";
    const b = intensityBucket(stat.avg_outage);
    return `hsl(var(--intensity-${b}))`;
  };

  return (
    <div className="relative">
      <svg viewBox="0 0 720 880" className="w-full h-auto" role="img" aria-label="বাংলাদেশের বিভাগ অনুযায়ী লোডশেডিং তীব্রতা ম্যাপ">
        {Object.entries(DIVISION_SHAPES).map(([name, { d, cx, cy }]) => {
          const stat = byDiv.get(name);
          const fill = colorFor(name);
          const region = (
            <g key={name} className="transition-base">
              <path
                d={d}
                fill={fill}
                stroke="hsl(var(--background))"
                strokeWidth={variant === "hero" ? 2 : 2.5}
                className="transition-base hover:opacity-80 cursor-pointer"
                style={{ filter: variant === "hero" ? "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" : "drop-shadow(0 4px 10px hsl(var(--foreground) / 0.08))" }}
              />
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                className={`font-display font-semibold pointer-events-none ${variant === "hero" ? "fill-foreground" : "fill-foreground"}`}
                style={{ fontSize: variant === "hero" ? 14 : 18 }}
              >
                {name}
              </text>
              {stat && (
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  className="font-numeric font-bold pointer-events-none fill-foreground/85"
                  style={{ fontSize: variant === "hero" ? 11 : 13 }}
                >
                  {fmtBn(stat.avg_outage, 1)} ঘ
                </text>
              )}
              <title>
                {name} — {stat ? `গড় ${fmtBn(stat.avg_outage, 1)} ঘণ্টা লোডশেডিং, ${fmtBn(stat.total_reports)}টি রিপোর্ট` : "তথ্য নেই"}
              </title>
            </g>
          );
          if (variant === "page") {
            return (
              <Link key={name} to={`/division/${slugify(name)}`}>
                {region}
              </Link>
            );
          }
          return region;
        })}
      </svg>

      <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
        {[0, 1, 2, 3, 4].map((b) => (
          <div key={b} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/40 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: `hsl(var(--intensity-${b}))` }} />
            <span className={`text-[10px] font-medium ${variant === "hero" ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
              {intensityLabel(b)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
