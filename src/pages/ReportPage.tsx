import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReportForm } from "@/components/ReportForm";
import { Shield, Lock, Zap } from "lucide-react";

const ReportPage = () => (
  <div className="min-h-screen bg-surface">
    <Helmet>
      <title>রিপোর্ট দিন — আজ আপনার এলাকায় কতক্ষণ লোডশেডিং?</title>
      <meta name="description" content="আপনার এলাকার বিদ্যুৎ পরিস্থিতি রিপোর্ট করুন। কোনো ফোন নম্বর বা ব্যক্তিগত তথ্য লাগবে না।" />
    </Helmet>
    <SiteHeader />
    <main className="container max-w-3xl py-8 md:py-12">
      <div className="mb-6 text-center">
        <div className="editorial-eyebrow">রিপোর্ট সাবমিশন</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1.5">আপনার এলাকায় আজ কতক্ষণ বিদ্যুৎ ছিল?</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          মাত্র ৪টি ধাপে রিপোর্ট দিন। আপনার তথ্য জাতীয় ড্যাশবোর্ডে সাথে সাথে যুক্ত হবে।
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {[
            { icon: Lock, label: "ফোন নম্বর লাগবে না" },
            { icon: Shield, label: "প্রাইভেসি নিরাপদ" },
            { icon: Zap, label: "৩০ সেকেন্ডে শেষ" },
          ].map((b) => (
            <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/60 text-xs font-medium">
              <b.icon className="h-3 w-3 text-primary" /> {b.label}
            </span>
          ))}
        </div>
      </div>
      <ReportForm />
    </main>
    <SiteFooter />
  </div>
);

export default ReportPage;
