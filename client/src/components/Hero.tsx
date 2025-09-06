import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    title: "Exquisite Sarees",
    subtitle: "for Every Occasion",
    description: "Discover our curated collection of premium sarees crafted by master artisans. From silk to cotton, bridal to everyday elegance.",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    altText: "Traditional Indian woman in elegant bridal saree with intricate golden embroidery"
  },
  {
    id: 2,
    title: "Bridal Collection",
    subtitle: "Wedding Perfection",
    description: "Make your special day unforgettable with our exquisite bridal sarees featuring intricate embroidery and timeless designs.",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    altText: "Ornate bridal saree in red with heavy golden embroidery and intricate beadwork"
  },
  {
    id: 3,
    title: "Designer Sarees",
    subtitle: "Contemporary Style",
    description: "Experience the fusion of traditional craftsmanship with modern design in our exclusive designer collection.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    altText: "Contemporary designer saree with modern cuts and fusion styling"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-champagne/20 to-blush/20">
      <div className="absolute inset-0 gradient-primary opacity-50"></div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl lg:text-6xl font-serif font-bold text-primary leading-tight">
              {currentSlideData.title}{" "}
              <span className="text-ruby">{currentSlideData.subtitle}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg">
              {currentSlideData.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="btn-primary"
                data-testid="button-explore-collection"
              >
                Explore Collection
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glassmorphism hover:bg-white/20 flex items-center gap-2"
                data-testid="button-watch-story"
              >
                <Play className="w-4 h-4" />
                Watch Our Story
              </Button>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="relative overflow-hidden rounded-2xl elegant-shadow">
              <img
                src={currentSlideData.image}
                alt={currentSlideData.altText}
                className="w-full h-auto max-w-lg mx-auto rounded-2xl transition-transform duration-700 hover:scale-105"
                data-testid="img-hero-slide"
              />
              
              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                data-testid="button-prev-slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                data-testid="button-next-slide"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-lavender/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-champagne/40 rounded-full blur-lg"></div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-primary" : "bg-primary/30"
              }`}
              data-testid={`button-slide-indicator-${index}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-4 h-4 bg-ruby rounded-full animate-float" style={{ animationDelay: "0.5s" }}></div>
      <div className="absolute bottom-32 left-10 w-6 h-6 bg-primary rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-40 left-1/4 w-3 h-3 bg-lavender rounded-full animate-float" style={{ animationDelay: "1.5s" }}></div>
    </section>
  );
}
