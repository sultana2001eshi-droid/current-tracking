import { Link } from "react-router-dom";
import { Zap, Shield, Lock, Heart } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card-grad">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-hero shadow-glow">
              <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold">বিদ্যুৎ নজরদারি বাংলাদেশ</span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">জনগণের রিপোর্টে তৈরি</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            দেশের যেকোনো গ্রাম, ইউনিয়ন বা জেলার বিদ্যুৎ পরিস্থিতি — সরাসরি জনগণের রিপোর্ট থেকে। 
            <span className="font-semibold text-foreground"> আপনার একটি রিপোর্ট বদলে দিতে পারে নীতিনির্ধারকের সিদ্ধান্ত।</span>
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: Lock, label: "ফোন নম্বর লাগবে না" },
              { icon: Shield, label: "প্রাইভেসি নিরাপদ" },
              { icon: Heart, label: "অলাভজনক উদ্যোগ" },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground">
                <b.icon className="h-3 w-3 text-primary" /> {b.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-3">প্ল্যাটফর্ম</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" to="/dashboard">লাইভ ড্যাশবোর্ড</Link></li>
            <li><Link className="hover:text-foreground" to="/map">জাতীয় হিটম্যাপ</Link></li>
            <li><Link className="hover:text-foreground" to="/report">রিপোর্ট সাবমিট</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-3">এই ডেটা সম্পর্কে</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            এই ডেটা জনগণের স্বপ্রণোদিত রিপোর্টের উপর ভিত্তি করে। সরকারি সিদ্ধান্তে সহায়ক ইনসাইট, মিডিয়া ও গবেষকদের জন্য উন্মুক্ত।
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© ২০২৫ বিদ্যুৎ নজরদারি বাংলাদেশ</span>
          <span>সকল ডেটা পাবলিক ডোমেইনে উন্মুক্ত</span>
        </div>
      </div>
    </footer>
  );
};
