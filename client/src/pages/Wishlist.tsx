import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { WishlistItemWithProduct } from "@shared/schema";

export default function Wishlist() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading: isWishlistLoading } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your wishlist.",
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
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", {
        productId: productId,
        quantity: 1,
      });
    },
    onSuccess: (_, productId) => {
      const product = wishlistItems.find(item => item.product.id === productId)?.product;
      toast({
        title: "Added to Cart",
        description: `${product?.name} has been added to your cart.`,
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

  if (isLoading || isWishlistLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Save your favorite sarees to your wishlist and never lose track of items you love!
            </p>
            <Link href="/products">
              <Button className="btn-primary">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne/20 to-blush/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" data-testid="button-back-to-shopping">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shopping
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
            const discountPercentage = item.product.originalPrice 
              ? Math.round(((parseFloat(item.product.originalPrice) - parseFloat(item.product.price)) / parseFloat(item.product.originalPrice)) * 100)
              : 0;

            return (
              <div key={item.id} className="group bg-white rounded-2xl elegant-shadow luxury-card transition-all duration-300 overflow-hidden" data-testid={`wishlist-item-${item.product.id}`}>
                <div className="relative overflow-hidden">
                  <Link href={`/products/${item.product.slug}`}>
                    <img
                      src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
                      alt={primaryImage?.altText || item.product.name}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                      data-testid={`img-wishlist-item-${item.product.id}`}
                    />
                  </Link>

                  {/* Remove from wishlist button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeFromWishlistMutation.mutate(item.product.id)}
                    disabled={removeFromWishlistMutation.isPending}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
                    data-testid={`button-remove-wishlist-${item.product.id}`}
                  >
                    <Heart className="w-4 h-4 fill-ruby text-ruby" />
                  </Button>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {item.product.isNew && (
                      <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </div>
                    )}
                    {item.product.isSale && discountPercentage > 0 && (
                      <div className="bg-mint text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {discountPercentage}% off
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-serif font-semibold text-lg mb-2 group-hover:text-primary transition-colors" data-testid={`text-wishlist-item-name-${item.product.id}`}>
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-muted-foreground mb-4" data-testid={`text-wishlist-item-category-${item.product.id}`}>
                    {item.product.category?.name || item.product.fabric || "Premium Collection"}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-primary" data-testid={`text-wishlist-item-price-${item.product.id}`}>
                      ₹{parseFloat(item.product.price).toLocaleString()}
                    </span>
                    {item.product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through" data-testid={`text-wishlist-item-original-price-${item.product.id}`}>
                        ₹{parseFloat(item.product.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToCartMutation.mutate(item.product.id)}
                      disabled={addToCartMutation.isPending || item.product.stock === 0}
                      className="flex-1 btn-primary"
                      size="sm"
                      data-testid={`button-add-cart-${item.product.id}`}
                    >
                      {addToCartMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Adding...
                        </>
                      ) : item.product.stock === 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlistMutation.mutate(item.product.id)}
                      disabled={removeFromWishlistMutation.isPending}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-remove-item-${item.product.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button variant="outline" size="lg" className="btn-outline">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
