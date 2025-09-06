import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProductWithImages } from "@shared/schema";

export default function OrderTracking() {
  const [location] = useLocation();
  const orderId = location.split('/').pop() || '';
  const { isAuthenticated } = useAuth();

  const { data: order, isLoading } = useQuery<any>({
    queryKey: ["/api/orders", orderId],
    enabled: isAuthenticated && !!orderId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/profile">
          <Button>View All Orders</Button>
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'processing': return <Package className="w-5 h-5 text-orange-600" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <Clock className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const trackingSteps = [
    { status: 'confirmed', label: 'Order Confirmed', description: 'We have received your order' },
    { status: 'processing', label: 'Processing', description: 'Your order is being prepared' },
    { status: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
    { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
  ];

  const getCurrentStep = () => {
    switch (order.status) {
      case 'confirmed': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne/20 to-blush/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">
            Order Tracking
          </h1>
          <p className="text-muted-foreground">
            Track your order: {order.orderNumber}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order {order.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                  <p className="text-lg font-semibold mt-2">₹{parseFloat(order.total).toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Tracker */}
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  {trackingSteps.map((step, index) => (
                    <div key={step.status} className="flex flex-col items-center relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                        index <= currentStep 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {index <= currentStep ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-current"></div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${
                          index <= currentStep ? 'text-primary' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 -z-0">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                      {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4" />
                      Estimated Delivery
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.status === 'delivered' 
                        ? 'Delivered' 
                        : `${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}`
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => {
                  const primaryImage = item.product.images?.find((img: any) => img.isPrimary) || item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <img
                        src={primaryImage?.imageUrl || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link href={`/products/${item.product.slug}`}>
                          <h4 className="font-medium hover:text-primary transition-colors">
                            {item.product.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-medium">
                          ₹{parseFloat(item.total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              {/* Order Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{parseFloat(order.shipping).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{parseFloat(order.tax).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{parseFloat(order.total).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact our customer support team for any questions about your order.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    Call Support
                  </Button>
                  <Button variant="outline" size="sm">
                    Live Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}