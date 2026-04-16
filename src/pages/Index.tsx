import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { DashboardSection, useDashboardData } from "@/components/DashboardSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { data } = useDashboardData();

  return (
    <div className="min-h-screen bg-surface">
      <Helmet>
        <title>বিদ্যুৎ নজরদারি বাংলাদেশ — লাইভ লোডশেডিং ট্র্যাকার</title>
        <meta name="description" content="জনগণের রিপোর্টে তৈরি দেশের সবচেয়ে বড় বিদ্যুৎ পরিস্থিতি ম্যাপ। আজ বাংলাদেশের কোন বিভাগ-জেলায় কতক্ষণ লোডশেডিং হয়েছে — লাইভ ডেটা।" />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "বিদ্যুৎ নজরদারি বাংলাদেশ",
          url: "/",
          description: "বাংলাদেশের লোডশেডিং রিপোর্টিং ও মনিটরিং প্ল্যাটফর্ম",
        })}</script>
      </Helmet>
      <SiteHeader />
      <main>
        <Hero totalReports={data?.totalReports ?? 0} avgOutage={data?.avgOutage ?? 0} />
        <DashboardSection />

        {/* Map CTA */}
        <section className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-hero p-8 md:p-12 text-primary-foreground shadow-elegant"
          >
            <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
            <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-xs font-semibold mb-3">
                  <MapIcon className="h-3 w-3" /> জাতীয় হিটম্যাপ
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">পুরো দেশের ছবি একটাই ম্যাপে</h2>
                <p className="text-primary-foreground/85 mb-5 max-w-lg">
                  বিভাগ থেকে গ্রাম পর্যন্ত — কোথায় কতটা লোডশেডিং হচ্ছে, এক নজরে দেখুন।
                </p>
                <Button asChild size="lg" className="bg-amber text-secondary-foreground shadow-amber hover:opacity-95 rounded-2xl">
                  <Link to="/map">হিটম্যাপ দেখুন <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <SiteFooter />

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
        <Button asChild className="w-full h-12 bg-amber text-secondary-foreground shadow-amber rounded-2xl font-semibold">
          <Link to="/report">আপনার এলাকার রিপোর্ট দিন</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
