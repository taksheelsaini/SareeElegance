import { useState } from "react";
import { Link } from "wouter";
import { X, Heart, ShoppingCart, Star, Compare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ProductWithImages } from "@shared/schema";

interface ProductComparisonProps {
  products: ProductWithImages[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export default function ProductComparison({ products, onRemoveProduct, onClearAll }: ProductComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (products.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Compare className="w-4 h-4 mr-2" />
            Compare (0)
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Comparison</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Compare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Add products to comparison by clicking the compare button on product cards.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Compare className="w-4 h-4 mr-2" />
          Compare ({products.length})
          {products.length > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {products.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Compare Products ({products.length})</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            const discountPercentage = product.originalPrice 
              ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
              : 0;

            return (
              <div key={product.id} className="border rounded-lg p-4 relative">
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveProduct(product.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Product Image */}
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <img
                      src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(parseFloat(product.rating || '0'))
                              ? 'fill-current'
                              : 'stroke-current fill-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.rating} ({product.reviewCount || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        ₹{parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{parseFloat(product.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {discountPercentage > 0 && (
                      <Badge className="bg-mint text-green-800 text-xs">
                        {discountPercentage}% off
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Specifications */}
                  <div className="space-y-2 text-sm">
                    {product.fabric && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fabric:</span>
                        <span>{product.fabric}</span>
                      </div>
                    )}
                    {product.occasion && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Occasion:</span>
                        <span>{product.occasion}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Color:</span>
                        <span>{product.color}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Summary */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-4">Quick Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Price Range:</span>
              <div className="mt-1">
                ₹{Math.min(...products.map(p => parseFloat(p.price))).toLocaleString()} - 
                ₹{Math.max(...products.map(p => parseFloat(p.price))).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="font-medium">Fabrics:</span>
              <div className="mt-1">
                {[...new Set(products.map(p => p.fabric).filter(Boolean))].join(', ') || 'Various'}
              </div>
            </div>
            <div>
              <span className="font-medium">Occasions:</span>
              <div className="mt-1">
                {[...new Set(products.map(p => p.occasion).filter(Boolean))].join(', ') || 'Various'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}