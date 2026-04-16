import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { locationRepository, recentVillages } from "@/repositories/locationRepository";
import type { BdDivision, BdDistrict, BdUpazila, BdUnion } from "@/data/bd";

export interface LocationValue {
  division: string; // bn name
  district: string;
  upazila: string;
  union_name: string;
  village: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
}

interface Props {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}

interface ComboItem {
  id: string;
  bn: string;
  en: string;
}

const Combo = ({
  label,
  required,
  placeholder,
  items,
  selectedBn,
  onPick,
  disabled,
  loading,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  items: ComboItem[];
  selectedBn: string;
  onPick: (item: ComboItem) => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label className="text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "mt-1.5 w-full justify-between font-normal h-10",
              !selectedBn && "text-muted-foreground"
            )}
          >
            <span className="truncate">{selectedBn || placeholder}</span>
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command
            filter={(value, search) => {
              if (!search) return 1;
              return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="খুঁজুন…" className="h-10" />
            <CommandList className="max-h-[260px]">
              <CommandEmpty>কোনো ফলাফল পাওয়া যায়নি</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.bn} ${item.en}`}
                    onSelect={() => {
                      onPick(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBn === item.bn ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{item.bn}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.en}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const LocationPicker = ({ value, onChange }: Props) => {
  const divisions = useMemo<BdDivision[]>(() => locationRepository.divisions(), []);
  const districts = useMemo<BdDistrict[]>(
    () => (value.divisionId ? locationRepository.districts(value.divisionId) : []),
    [value.divisionId]
  );
  const upazilas = useMemo<BdUpazila[]>(
    () => (value.districtId ? locationRepository.upazilas(value.districtId) : []),
    [value.districtId]
  );

  const [unions, setUnions] = useState<BdUnion[]>([]);
  const [unionsLoading, setUnionsLoading] = useState(false);

  useEffect(() => {
    if (!value.upazilaId) {
      setUnions([]);
      return;
    }
    let cancelled = false;
    setUnionsLoading(true);
    locationRepository.unions(value.upazilaId).then((u) => {
      if (!cancelled) {
        setUnions(u);
        setUnionsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value.upazilaId]);

  const recents = useMemo(() => recentVillages.list(), [value.village]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Combo
        label="বিভাগ"
        required
        placeholder="বিভাগ নির্বাচন"
        items={divisions}
        selectedBn={value.division}
        onPick={(d) =>
          onChange({
            division: d.bn,
            divisionId: d.id,
            district: "",
            districtId: undefined,
            upazila: "",
            upazilaId: undefined,
            union_name: "",
            village: value.village,
          })
        }
      />
      <Combo
        label="জেলা"
        required
        placeholder="জেলা নির্বাচন"
        items={districts}
        selectedBn={value.district}
        disabled={!value.divisionId}
        onPick={(d) =>
          onChange({
            ...value,
            district: d.bn,
            districtId: d.id,
            upazila: "",
            upazilaId: undefined,
            union_name: "",
          })
        }
      />
      <Combo
        label="উপজেলা"
        placeholder="উপজেলা নির্বাচন"
        items={upazilas}
        selectedBn={value.upazila}
        disabled={!value.districtId}
        onPick={(u) =>
          onChange({
            ...value,
            upazila: u.bn,
            upazilaId: u.id,
            union_name: "",
          })
        }
      />
      <Combo
        label="ইউনিয়ন/পৌরসভা"
        placeholder="ইউনিয়ন নির্বাচন"
        items={unions}
        selectedBn={value.union_name}
        disabled={!value.upazilaId}
        loading={unionsLoading}
        onPick={(u) => onChange({ ...value, union_name: u.bn })}
      />
      <div className="sm:col-span-2">
        <Label className="text-sm">গ্রাম/এলাকা</Label>
        <Input
          placeholder="আপনার গ্রাম বা এলাকার নাম লিখুন"
          value={value.village}
          onChange={(e) => onChange({ ...value, village: e.target.value })}
          className="mt-1.5"
          maxLength={60}
        />
        {recents.length > 0 && !value.village && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] text-muted-foreground self-center">সাম্প্রতিক:</span>
            {recents.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ...value, village: v })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted hover:bg-accent text-xs"
              >
                <MapPin className="h-3 w-3" /> {v}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
