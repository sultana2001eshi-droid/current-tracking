import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface Props {
  value?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

export const DateRangePicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );

  const label = value
    ? `${format(value.from, "dd MMM")} – ${format(value.to, "dd MMM")}`
    : "তারিখ বাছাই";

  const apply = () => {
    if (draft?.from && draft?.to) {
      const to = new Date(draft.to);
      to.setHours(23, 59, 59, 999);
      onChange({ from: draft.from, to });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 rounded-full gap-2 text-xs font-semibold",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={1}
          disabled={(d) => d > new Date()}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex items-center justify-end gap-2 p-3 border-t">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            বাতিল
          </Button>
          <Button
            size="sm"
            onClick={apply}
            disabled={!draft?.from || !draft?.to}
          >
            প্রয়োগ করুন
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
