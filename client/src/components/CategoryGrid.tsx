import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

const defaultCategories = [
  {
    id: "silk",
    name: "Silk Sarees",
    slug: "silk-sarees",
    description: "Premium Collection",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
  },
  {
    id: "cotton",
    name: "Cotton Sarees",
    slug: "cotton-sarees",
    description: "Everyday Elegance",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
  },
  {
    id: "designer",
    name: "Designer Collection",
    slug: "designer-collection",
    description: "Contemporary Style",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
  },
  {
    id: "bridal",
    name: "Bridal Collection",
    slug: "bridal-collection",
    description: "Wedding Special",
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
  },
];

export default function CategoryGrid() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Use default categories if API returns empty or is loading
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl lg:text-4xl font-serif font-bold text-primary mb-4">
            Shop by Category
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From traditional silk sarees to contemporary designer pieces, find your perfect match for every occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCategories.map((category) => (
            <Link
              key={category.id || category.slug}
              href={`/products?categoryId=${category.id || category.slug}`}
              className="group cursor-pointer"
              data-testid={`link-category-${category.slug}`}
            >
              <div className="relative overflow-hidden rounded-2xl luxury-card transition-all duration-300 elegant-shadow">
                <img
                  src={category.imageUrl || "/placeholder-category.jpg"}
                  alt={`${category.name} - ${category.description}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  data-testid={`img-category-${category.slug}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-xl font-serif font-semibold mb-1" data-testid={`text-category-name-${category.slug}`}>
                    {category.name}
                  </h4>
                  <p className="text-sm opacity-90" data-testid={`text-category-description-${category.slug}`}>
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
