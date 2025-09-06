import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Lock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { CartItemWithProduct } from "@shared/schema";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [billingForm, setBillingForm] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      setLocation("/api/login");
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  // Fetch cart items
  const { data: cartItems = [], isLoading: isCartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/checkout/create-order", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${order.orderNumber} has been confirmed.`,
      });
      setLocation(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an issue processing your payment.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isCartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    setLocation("/cart");
    return null;
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = subtotal > 2999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!shippingForm.fullName || !shippingForm.email || !shippingForm.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create mock payment intent
      const paymentIntent = await apiRequest("POST", "/api/checkout/create-payment-intent", {
        amount: Math.round(total * 100), // Convert to paise for Indian currency
        currency: 'inr',
      }).then(res => res.json());

      // Create order
      await createOrderMutation.mutateAsync({
        paymentIntentId: paymentIntent.id,
        shippingAddress: shippingForm,
        billingAddress: sameAsShipping ? shippingForm : billingForm,
      });
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne/20 to-blush/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/cart")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">
            Secure Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your order securely and safely
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your full address"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={shippingForm.pincode}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Pincode"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold text-blue-900">Secure Demo Payment</span>
                  </div>
                  <p className="text-sm text-blue-700 text-center mb-4">
                    This is a demo checkout. No real payment will be processed.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-700">Accepted Cards:</div>
                      <div className="text-gray-600">Visa, MasterCard, RuPay</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-700">UPI & Wallets:</div>
                      <div className="text-gray-600">GPay, PhonePe, Paytm</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => {
                    const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.product.category?.name}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <span className="font-semibold">₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || createOrderMutation.isPending}
                  className="w-full mt-6 btn-primary"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order ₹{total.toLocaleString()}
                    </>
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Your order will be processed securely
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}