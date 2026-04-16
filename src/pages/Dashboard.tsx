import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DashboardSection } from "@/components/DashboardSection";

const Dashboard = () => (
  <div className="min-h-screen bg-surface">
    <Helmet>
      <title>লাইভ ড্যাশবোর্ড — বিদ্যুৎ নজরদারি বাংলাদেশ</title>
      <meta name="description" content="বাংলাদেশের লাইভ লোডশেডিং ড্যাশবোর্ড। বিভাগ অনুযায়ী গড় আউটেজ, শীর্ষ ক্ষতিগ্রস্ত জেলা ও ২৪ ঘণ্টার ট্রেন্ড।" />
    </Helmet>
    <SiteHeader />
    <main>
      <div className="border-b border-border/60 bg-card-grad">
        <div className="container py-8">
          <div className="editorial-eyebrow">জাতীয় ড্যাশবোর্ড</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">বাংলাদেশের লাইভ বিদ্যুৎ পরিস্থিতি</h1>
        </div>
      </div>
      <DashboardSection />
    </main>
    <SiteFooter />
  </div>
);

export default Dashboard;
