import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  tone?: "primary" | "amber" | "destructive" | "accent";
  delay?: number;
}

const toneClasses: Record<NonNullable<KPICardProps["tone"]>, string> = {
  primary: "from-primary/10 to-primary/0 text-primary",
  amber: "from-secondary/15 to-secondary/0 text-secondary",
  destructive: "from-destructive/10 to-destructive/0 text-destructive",
  accent: "from-accent/10 to-accent/0 text-accent",
};

export const KPICard = ({ icon: Icon, label, value, trend, tone = "primary", delay = 0 }: KPICardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card-grad p-5 shadow-soft hover:shadow-elegant transition-smooth group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${toneClasses[tone]} opacity-50 pointer-events-none`} />
      <div className="relative flex items-start justify-between mb-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-background/80 border border-border/60 ${toneClasses[tone].split(" ").pop()}`}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {trend && (
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-background/80 text-muted-foreground border border-border/40">
            {trend}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="kpi-number text-foreground">{value}</div>
        <div className="text-xs font-medium text-muted-foreground mt-1.5 leading-snug">{label}</div>
      </div>
    </motion.div>
  );
};
