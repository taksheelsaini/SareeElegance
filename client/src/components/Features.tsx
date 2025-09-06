import { Truck, RotateCcw, Award, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹2,999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "15-day return policy",
  },
  {
    icon: Award,
    title: "Authentic Products",
    description: "Genuine quality guaranteed",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Customer care assistance",
  },
];

export default function Features() {
  return (
    <section className="py-16 gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 elegant-shadow group-hover:scale-110 transition-transform" data-testid={`feature-icon-${index}`}>
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-serif font-semibold text-lg mb-2" data-testid={`feature-title-${index}`}>
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm" data-testid={`feature-description-${index}`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
