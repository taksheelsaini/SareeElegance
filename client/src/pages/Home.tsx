import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingProducts from "@/components/TrendingProducts";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CategoryGrid />
      <TrendingProducts />
      <Features />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
