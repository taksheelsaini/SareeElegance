import { useState } from "react";
import { useLocation } from "wouter";
import { User, CreditCard, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface GuestCheckoutProps {
  cartItems: any[];
  onProceedToPayment: (guestInfo: any) => void;
}

export default function GuestCheckout({ cartItems, onProceedToPayment }: GuestCheckoutProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [guestForm, setGuestForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!guestForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guestForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!guestForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!guestForm.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!guestForm.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!guestForm.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!guestForm.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(guestForm.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onProceedToPayment(guestForm);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product?.price || '0') * item.quantity), 0);
  const shipping = subtotal > 2999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

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
            Guest Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your purchase without creating an account
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Guest Information Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={guestForm.fullName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestForm.email}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={guestForm.address}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your full address"
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={guestForm.city}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={guestForm.state}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        className={errors.state ? 'border-red-500' : ''}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={guestForm.pincode}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Pincode"
                        className={errors.pincode ? 'border-red-500' : ''}
                      />
                      {errors.pincode && (
                        <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium text-blue-900 mb-2">Why create an account?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Track your orders easily</li>
                      <li>• Faster checkout for future purchases</li>
                      <li>• Manage your wishlist</li>
                      <li>• Get exclusive offers and updates</li>
                    </ul>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setLocation("/api/login")}
                    >
                      Create Account Instead
                    </Button>
                  </div>
                </form>
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
                    const primaryImage = item.product?.images?.find((img: any) => img.isPrimary) || item.product?.images?.[0];
                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
                          alt={item.product?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product?.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.product?.category?.name}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <span className="font-semibold">₹{(parseFloat(item.product?.price || '0') * item.quantity).toLocaleString()}</span>
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
                  onClick={handleSubmit}
                  className="w-full mt-6 btn-primary"
                  size="lg"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Continue to Payment
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Your information is secure and encrypted
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