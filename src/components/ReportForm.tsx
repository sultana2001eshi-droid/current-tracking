import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, MapPin, Clock, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fmtBn } from "@/lib/bd-data";
import { LocationPicker, type LocationValue } from "./LocationPicker";
import { reportRepository } from "@/repositories/reportRepository";
import { recentVillages } from "@/repositories/locationRepository";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "লোকেশন নির্বাচন", icon: MapPin },
  { id: 2, title: "সময় তথ্য", icon: Clock },
  { id: 3, title: "অভিজ্ঞতা", icon: Sparkles },
  { id: 4, title: "জমা দিন", icon: Send },
];

interface FormData {
  location: LocationValue;
  electricity_hours: string;
  outage_hours: string;
  outage_slots: string;
  currently_on: "yes" | "no";
  low_voltage: boolean;
  transformer_issue: boolean;
  appliance_issue: boolean;
  comments: string;
}

const initial: FormData = {
  location: {
    division: "",
    district: "",
    upazila: "",
    union_name: "",
    village: "",
  },
  electricity_hours: "",
  outage_hours: "",
  outage_slots: "",
  currently_on: "yes",
  low_voltage: false,
  transformer_issue: false,
  appliance_issue: false,
  comments: "",
};

export const ReportForm = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((p) => ({ ...p, [k]: v }));

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!data.division) return "অনুগ্রহ করে বিভাগ নির্বাচন করুন";
      if (!data.district) return "অনুগ্রহ করে জেলা নির্বাচন করুন";
    }
    if (step === 2) {
      const eh = Number(data.electricity_hours);
      const oh = Number(data.outage_hours);
      if (isNaN(eh) || eh < 0 || eh > 24) return "বিদ্যুৎ ঘণ্টা ০ থেকে ২৪ এর মধ্যে দিন";
      if (isNaN(oh) || oh < 0 || oh > 24) return "লোডশেডিং ঘণ্টা ০ থেকে ২৪ এর মধ্যে দিন";
      if (eh + oh > 24) return "মোট ঘণ্টা ২৪ এর বেশি হতে পারে না";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      const slug = [data.division, data.district, data.upazila, data.village]
        .filter(Boolean)
        .map(slugify)
        .join("-");

      const { error } = await supabase.from("outage_reports").insert({
        division: data.division,
        district: data.district,
        upazila: data.upazila || null,
        union_name: data.union_name || null,
        village: data.village || null,
        electricity_hours: Number(data.electricity_hours),
        outage_hours: Number(data.outage_hours),
        outage_slots: data.outage_slots || null,
        currently_on: data.currently_on === "yes",
        low_voltage: data.low_voltage,
        transformer_issue: data.transformer_issue,
        appliance_issue: data.appliance_issue,
        comments: data.comments.trim().slice(0, 500) || null,
        device_hash: slug.slice(0, 64),
        confidence_score: 0.9,
      });
      if (error) throw error;
      setDone(true);
      toast.success("ধন্যবাদ! আপনার রিপোর্ট সফলভাবে জমা হয়েছে");
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (e: any) {
      toast.error("রিপোর্ট জমা দিতে সমস্যা হয়েছে: " + (e?.message || "অজানা ত্রুটি"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-card border border-border/60 p-10 text-center shadow-elegant"
      >
        <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-success/15 text-success mb-4">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">ধন্যবাদ!</h2>
        <p className="text-muted-foreground">
          আপনার রিপোর্ট জাতীয় ড্যাশবোর্ডে যুক্ত হয়েছে। <br className="hidden sm:inline" />
          ডেটা পেজে নিয়ে যাচ্ছি…
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-elegant overflow-hidden">
      {/* Progress */}
      <div className="px-5 sm:px-8 pt-7">
        <div className="flex items-center justify-between mb-5">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-initial">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-base ${
                  s.id <= step
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? <Check className="h-4 w-4" /> : <span className="font-numeric text-sm font-semibold">{fmtBn(s.id)}</span>}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-base ${s.id < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mb-1">
          <div className="editorial-eyebrow">ধাপ {fmtBn(step)} / {fmtBn(4)}</div>
          <h2 className="font-display text-xl sm:text-2xl font-bold mt-0.5">{STEPS[step - 1].title}</h2>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-6 min-h-[340px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">আপনি কোন এলাকার রিপোর্ট দিতে চান?</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="div">বিভাগ <span className="text-destructive">*</span></Label>
                    <Select value={data.division} onValueChange={(v) => { update("division", v); update("district", ""); }}>
                      <SelectTrigger id="div" className="mt-1.5"><SelectValue placeholder="বিভাগ নির্বাচন করুন" /></SelectTrigger>
                      <SelectContent>{DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dist">জেলা <span className="text-destructive">*</span></Label>
                    <Select value={data.district} onValueChange={(v) => update("district", v)} disabled={!data.division}>
                      <SelectTrigger id="dist" className="mt-1.5"><SelectValue placeholder="জেলা নির্বাচন করুন" /></SelectTrigger>
                      <SelectContent>
                        {data.division && DISTRICTS[data.division as keyof typeof DISTRICTS]?.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="up">উপজেলা</Label>
                    <Input id="up" placeholder="যেমন: কালিয়াকৈর" value={data.upazila} onChange={(e) => update("upazila", e.target.value)} className="mt-1.5" maxLength={50} />
                  </div>
                  <div>
                    <Label htmlFor="un">ইউনিয়ন</Label>
                    <Input id="un" placeholder="যেমন: ফুলবাড়িয়া" value={data.union_name} onChange={(e) => update("union_name", e.target.value)} className="mt-1.5" maxLength={50} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="vil">গ্রাম</Label>
                    <Input id="vil" placeholder="আপনার গ্রামের নাম" value={data.village} onChange={(e) => update("village", e.target.value)} className="mt-1.5" maxLength={50} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">আজ কতক্ষণ বিদ্যুৎ ছিল এবং কতক্ষণ ছিল না?</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="eh">আজ মোট কত ঘণ্টা বিদ্যুৎ ছিল? <span className="text-destructive">*</span></Label>
                    <Input id="eh" type="number" min={0} max={24} step={0.5} placeholder="যেমন: ১৮" value={data.electricity_hours} onChange={(e) => update("electricity_hours", e.target.value)} className="mt-1.5 font-numeric text-lg" />
                  </div>
                  <div>
                    <Label htmlFor="oh">আজ মোট কত ঘণ্টা লোডশেডিং? <span className="text-destructive">*</span></Label>
                    <Input id="oh" type="number" min={0} max={24} step={0.5} placeholder="যেমন: ৬" value={data.outage_hours} onChange={(e) => update("outage_hours", e.target.value)} className="mt-1.5 font-numeric text-lg" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="slots">কখন কখন বিদ্যুৎ গেছে? <span className="text-muted-foreground text-xs">(ঐচ্ছিক)</span></Label>
                  <Input id="slots" placeholder="যেমন: সকাল ৮-১০, রাত ৯-১১" value={data.outage_slots} onChange={(e) => update("outage_slots", e.target.value)} className="mt-1.5" maxLength={120} />
                </div>
                <div>
                  <Label className="mb-2 block">এখন কি বিদ্যুৎ আছে?</Label>
                  <RadioGroup value={data.currently_on} onValueChange={(v) => update("currently_on", v as "yes" | "no")} className="flex gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-base flex-1">
                      <RadioGroupItem value="yes" id="cy" /> <span>হ্যাঁ, এখন বিদ্যুৎ আছে</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border has-[:checked]:border-destructive has-[:checked]:bg-destructive/5 cursor-pointer transition-base flex-1">
                      <RadioGroupItem value="no" id="cn" /> <span>না, এখনও বন্ধ</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">কোন কোন সমস্যার মুখোমুখি হয়েছেন? <span className="text-xs">(ঐচ্ছিক)</span></p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    { k: "transformer_issue" as const, label: "ট্রান্সফরমার সমস্যা" },
                    { k: "low_voltage" as const, label: "ভোল্টেজ কম ছিল" },
                    { k: "appliance_issue" as const, label: "ফ্যান/ফ্রিজ সমস্যা" },
                  ].map((item) => (
                    <label key={item.k} className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-base">
                      <Checkbox checked={data[item.k]} onCheckedChange={(v) => update(item.k, !!v)} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <Label htmlFor="cm">আপনার মন্তব্য</Label>
                  <Textarea id="cm" placeholder="আপনার এলাকার পরিস্থিতি কেমন? কোনো বিশেষ ঘটনা?" value={data.comments} onChange={(e) => update("comments", e.target.value)} className="mt-1.5 min-h-[100px] resize-none" maxLength={500} />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{fmtBn(data.comments.length)}/{fmtBn(500)}</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">নিচের তথ্য যাচাই করে রিপোর্ট জমা দিন:</p>
                <div className="rounded-2xl bg-muted/50 p-5 space-y-2.5 border border-border/60">
                  <Row label="লোকেশন" value={[data.village, data.union_name, data.upazila, data.district, data.division].filter(Boolean).join(", ") || "—"} />
                  <Row label="বিদ্যুৎ ছিল" value={`${fmtBn(Number(data.electricity_hours), 1)} ঘণ্টা`} />
                  <Row label="লোডশেডিং" value={`${fmtBn(Number(data.outage_hours), 1)} ঘণ্টা`} />
                  {data.outage_slots && <Row label="সময়" value={data.outage_slots} />}
                  <Row label="বর্তমান অবস্থা" value={data.currently_on === "yes" ? "বিদ্যুৎ আছে" : "এখনও বন্ধ"} />
                  {(data.transformer_issue || data.low_voltage || data.appliance_issue) && (
                    <Row label="অভিযোগ" value={[
                      data.transformer_issue && "ট্রান্সফরমার",
                      data.low_voltage && "ভোল্টেজ কম",
                      data.appliance_issue && "ফ্যান/ফ্রিজ",
                    ].filter(Boolean).join(", ")} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 আপনার একটি রিপোর্ট বদলে দিতে পারে বিদ্যুৎ ব্যবস্থাপনার সিদ্ধান্ত। কোনো ফোন নম্বর বা ব্যক্তিগত তথ্য প্রয়োজন নেই।
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 sm:px-8 py-5 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={step === 1 || submitting}>
          <ChevronLeft className="h-4 w-4 mr-1" /> পেছনে
        </Button>
        {step < 4 ? (
          <Button onClick={next} className="bg-primary text-primary-foreground shadow-glow">
            পরের ধাপ <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting} className="bg-amber text-secondary-foreground shadow-amber font-semibold">
            {submitting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> জমা হচ্ছে…</> : <><Send className="h-4 w-4 mr-1.5" /> রিপোর্ট সাবমিট করুন</>}
          </Button>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="text-muted-foreground min-w-[110px]">{label}:</span>
    <span className="font-medium text-foreground flex-1">{value}</span>
  </div>
);
