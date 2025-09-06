import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CartItemWithProduct } from "@shared/schema";

export default function Cart() {
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

  // Fetch cart items
  const { data: cartItems = [], isLoading: isCartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
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
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
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
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
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
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isCartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
              ))}
            </div>
            <div className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = subtotal > 2999 ? 0 : 99;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet. Start shopping to find your perfect saree!
            </p>
            <Link href="/products">
              <Button className="btn-primary">
                Continue Shopping
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
              <Button variant="ghost" size="sm" data-testid="button-continue-shopping">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 elegant-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-semibold">Cart Items</h2>
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => clearCartMutation.mutate()}
                    disabled={clearCartMutation.isPending}
                    className="text-destructive hover:text-destructive"
                    data-testid="button-clear-cart"
                  >
                    Clear Cart
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {cartItems.map((item) => {
                  const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
                  
                  return (
                    <div key={item.id} className="flex gap-4 pb-6 border-b last:border-b-0" data-testid={`cart-item-${item.product.id}`}>
                      <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                        <img
                          src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
                          alt={primaryImage?.altText || item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          data-testid={`img-cart-item-${item.product.id}`}
                        />
                      </Link>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/products/${item.product.slug}`}>
                              <h3 className="font-semibold hover:text-primary transition-colors" data-testid={`text-cart-item-name-${item.product.id}`}>
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-category-${item.product.id}`}>
                              {item.product.category?.name || item.product.fabric}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemMutation.mutate(item.product.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-destructive hover:text-destructive p-1"
                            data-testid={`button-remove-item-${item.product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantityMutation.mutate({
                                  productId: item.product.id,
                                  quantity: Math.max(1, item.quantity - 1)
                                })}
                                disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                data-testid={`button-decrease-${item.product.id}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="px-3 py-2 min-w-[3rem] text-center" data-testid={`text-quantity-${item.product.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantityMutation.mutate({
                                  productId: item.product.id,
                                  quantity: item.quantity + 1
                                })}
                                disabled={updateQuantityMutation.isPending}
                                data-testid={`button-increase-${item.product.id}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ₹{parseFloat(item.product.price).toLocaleString()} each
                            </span>
                          </div>
                          <span className="font-semibold text-lg" data-testid={`text-item-total-${item.product.id}`}>
                            ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 elegant-shadow sticky top-24">
              <h2 className="text-xl font-serif font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span data-testid="text-shipping">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span data-testid="text-tax">₹{tax.toFixed(0)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-total">₹{total.toLocaleString()}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add ₹{(2999 - subtotal).toLocaleString()} more for FREE shipping
                  </p>
                )}
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 btn-primary" size="lg" data-testid="button-checkout">
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Secure checkout powered by industry-standard encryption
                </p>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-mint rounded-full mr-3"></div>
                  Free shipping on orders above ₹2,999
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-mint rounded-full mr-3"></div>
                  15-day easy returns & exchanges
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-mint rounded-full mr-3"></div>
                  Authentic products guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
