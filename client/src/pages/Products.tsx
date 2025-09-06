import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid, List, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/ProductCard";
import type { ProductWithImages, Category } from "@shared/schema";

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    if (params.get('search')) setSearchQuery(params.get('search') || '');
    if (params.get('fabric')) setSelectedFabrics([params.get('fabric')!]);
    if (params.get('occasion')) setSelectedOccasions([params.get('occasion')!]);
  }, [location]);

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Build filters object
  const filters = {
    search: searchQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    fabric: selectedFabrics.length > 0 ? selectedFabrics[0] : undefined,
    occasion: selectedOccasions.length > 0 ? selectedOccasions[0] : undefined,
    color: selectedColors.length > 0 ? selectedColors[0] : undefined,
    sortBy: sortBy as 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular',
    limit: 20,
    offset: (currentPage - 1) * 20,
  };

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 0) {
          params.append(key, value.toString());
        }
      });
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const products: ProductWithImages[] = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const fabrics = ["Silk", "Cotton", "Chiffon", "Georgette", "Net", "Crepe"];
  const occasions = ["Bridal", "Party", "Casual", "Festival", "Office", "Wedding"];
  const colors = ["Red", "Blue", "Green", "Pink", "Yellow", "Black", "White", "Purple"];

  const handleFabricToggle = (fabric: string) => {
    setSelectedFabrics(prev => 
      prev.includes(fabric) 
        ? prev.filter(f => f !== fabric)
        : [...prev, fabric]
    );
    setCurrentPage(1);
  };

  const handleOccasionToggle = (occasion: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasion) 
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
    setCurrentPage(1);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
    setCurrentPage(1);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={50000}
            step={500}
            className="mb-4"
            data-testid="slider-price-range"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Fabric */}
      <div>
        <h3 className="font-semibold mb-4">Fabric</h3>
        <div className="space-y-3">
          {fabrics.map((fabric) => (
            <div key={fabric} className="flex items-center space-x-2">
              <Checkbox
                id={`fabric-${fabric}`}
                checked={selectedFabrics.includes(fabric)}
                onCheckedChange={() => handleFabricToggle(fabric)}
                data-testid={`checkbox-fabric-${fabric.toLowerCase()}`}
              />
              <label htmlFor={`fabric-${fabric}`} className="text-sm cursor-pointer">
                {fabric}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Occasion */}
      <div>
        <h3 className="font-semibold mb-4">Occasion</h3>
        <div className="space-y-3">
          {occasions.map((occasion) => (
            <div key={occasion} className="flex items-center space-x-2">
              <Checkbox
                id={`occasion-${occasion}`}
                checked={selectedOccasions.includes(occasion)}
                onCheckedChange={() => handleOccasionToggle(occasion)}
                data-testid={`checkbox-occasion-${occasion.toLowerCase()}`}
              />
              <label htmlFor={`occasion-${occasion}`} className="text-sm cursor-pointer">
                {occasion}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Color */}
      <div>
        <h3 className="font-semibold mb-4">Color</h3>
        <div className="space-y-3">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={() => handleColorToggle(color)}
                data-testid={`checkbox-color-${color.toLowerCase()}`}
              />
              <label htmlFor={`color-${color}`} className="text-sm cursor-pointer">
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-champagne/20 to-blush/20 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">
            Premium Saree Collection
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover our exquisite collection of handcrafted sarees, from traditional silk to contemporary designs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sarees..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="button-view-grid"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden" data-testid="button-mobile-filters">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Refine your search to find the perfect saree.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-6 elegant-shadow">
              <h2 className="text-xl font-serif font-semibold mb-6">Filters</h2>
              <FilterSidebar />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground" data-testid="text-results-count">
                Showing {products.length} of {total} results
              </p>
              {(selectedFabrics.length > 0 || selectedOccasions.length > 0 || selectedColors.length > 0) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFabrics([]);
                    setSelectedOccasions([]);
                    setSelectedColors([]);
                    setPriceRange([0, 50000]);
                    setCurrentPage(1);
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page"
                      >
                        Previous
                      </Button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            data-testid={`button-page-${pageNum}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFabrics([]);
                    setSelectedOccasions([]);
                    setSelectedColors([]);
                    setPriceRange([0, 50000]);
                    setCurrentPage(1);
                  }}
                  data-testid="button-clear-all-filters"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
