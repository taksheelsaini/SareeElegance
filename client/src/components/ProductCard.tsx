import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import type { ProductWithImages } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithImages;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const discountPercentage = product.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isInWishlist) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", {
          productId: product.id,
        });
      }
    },
    onSuccess: () => {
      setIsInWishlist(!isInWishlist);
      toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${product.name} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to manage your wishlist.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    toggleWishlistMutation.mutate();
  };

  return (
    <div className="group bg-white rounded-2xl elegant-shadow luxury-card transition-all duration-300 overflow-hidden" data-testid={`card-product-${product.id}`}>
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`} data-testid={`link-product-${product.id}`}>
          <img
            src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
            alt={primaryImage?.altText || product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            data-testid={`img-product-${product.id}`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-primary text-white" data-testid={`badge-new-${product.id}`}>
              New
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-ruby text-white" data-testid={`badge-trending-${product.id}`}>
              Trending
            </Badge>
          )}
          {product.isSale && discountPercentage > 0 && (
            <Badge className="bg-mint text-green-800" data-testid={`badge-sale-${product.id}`}>
              {discountPercentage}% off
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleWishlist}
            disabled={toggleWishlistMutation.isPending}
            className="mb-2 bg-white/90 hover:bg-white shadow-lg"
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-ruby text-ruby' : ''}`} />
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/products/${product.slug}`}>
            <Button
              variant="secondary"
              size="sm"
              className="bg-primary text-white hover:bg-ruby shadow-lg"
              data-testid={`button-quick-view-${product.id}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(parseFloat(product.rating || '0'))
                    ? 'fill-current'
                    : 'stroke-current fill-transparent'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2" data-testid={`text-reviews-${product.id}`}>
            ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Product Info */}
        <Link href={`/products/${product.slug}`}>
          <h4 className="font-serif font-semibold text-lg mb-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h4>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-4" data-testid={`text-product-category-${product.id}`}>
          {product.category?.name || product.fabric || "Premium Collection"}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
              ₹{parseFloat(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                ₹{parseFloat(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <Badge className="bg-mint text-green-800" data-testid={`text-discount-${product.id}`}>
              {discountPercentage}% off
            </Badge>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || product.stock === 0}
          className="w-full btn-primary"
          data-testid={`button-add-cart-${product.id}`}
        >
          {addToCartMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Adding...
            </>
          ) : product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
