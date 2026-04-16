import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { fmtBn } from "@/lib/bd-data";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  fontFamily: '"Hind Siliguri", sans-serif',
  boxShadow: "var(--shadow-elegant)",
  padding: "8px 12px",
};

interface DivisionStat {
  division: string;
  avg_outage: number;
  total_reports: number;
}

export const DivisionBarChart = ({ data }: { data: DivisionStat[] }) => {
  const sorted = [...data].sort((a, b) => b.avg_outage - a.avg_outage);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="mb-4">
        <div className="editorial-eyebrow">বিভাগ অনুযায়ী</div>
        <h3 className="font-display font-semibold text-base mt-0.5">গড় লোডশেডিং (ঘণ্টা)</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sorted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="division"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: '"Hind Siliguri"' }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtBn(v)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${fmtBn(v, 1)} ঘণ্টা`, "গড় লোডশেডিং"]}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          />
          <Bar dataKey="avg_outage" radius={[8, 8, 0, 0]}>
            {sorted.map((d, i) => {
              const intensity = d.avg_outage >= 10 ? 4 : d.avg_outage >= 7 ? 3 : d.avg_outage >= 4 ? 2 : 1;
              return <Cell key={i} fill={`hsl(var(--intensity-${intensity}))`} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TrendPoint {
  hour: string;
  outage: number;
}

export const HourlyTrendChart = ({ data }: { data: TrendPoint[] }) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="mb-4">
        <div className="editorial-eyebrow">২৪ ঘণ্টার ট্রেন্ড</div>
        <h3 className="font-display font-semibold text-base mt-0.5">গড় আউটেজ পরিবর্তন</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtBn}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtBn(v)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${fmtBn(v, 1)} ঘণ্টা`, "গড়"]}
            labelFormatter={(l) => `${fmtBn(l)} টা`}
          />
          <Line
            type="monotone"
            dataKey="outage"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 5 }}
            fill="url(#trendGrad)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DistrictStat {
  district: string;
  avg_outage: number;
}

export const TopDistrictsChart = ({ data }: { data: DistrictStat[] }) => {
  const top = [...data].sort((a, b) => b.avg_outage - a.avg_outage).slice(0, 10);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="mb-4">
        <div className="editorial-eyebrow">র‍্যাঙ্কিং</div>
        <h3 className="font-display font-semibold text-base mt-0.5">শীর্ষ ১০ ক্ষতিগ্রস্ত জেলা</h3>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtBn(v)}
          />
          <YAxis
            type="category"
            dataKey="district"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontFamily: '"Hind Siliguri"' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${fmtBn(v, 1)} ঘণ্টা`, "গড়"]}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          />
          <Bar dataKey="avg_outage" radius={[0, 8, 8, 0]} fill="hsl(var(--secondary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
