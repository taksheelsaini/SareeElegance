import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import type { ProductWithImages } from "@shared/schema";

export default function TrendingProducts() {
  const { data: products = [], isLoading } = useQuery<ProductWithImages[]>({
    queryKey: ["/api/products/featured?limit=8"],
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-3xl lg:text-4xl font-serif font-bold text-primary mb-2">
              Trending Sarees
            </h3>
            <p className="text-muted-foreground">
              Discover what's popular among our customers
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="p-2 rounded-full"
              data-testid="button-prev-trending"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="p-2 rounded-full"
              data-testid="button-next-trending"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {(products as ProductWithImages[]).length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(products as ProductWithImages[]).map((product: ProductWithImages) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline"
                size="lg"
                className="btn-outline"
                data-testid="button-view-all-products"
              >
                View All Products
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No trending products available at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check back later for our latest collections.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
