import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingBag, User, Menu, MapPin, HelpCircle, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Get cart count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Get wishlist count
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;

  const navigation = [
    { name: "All Categories", href: "/products", active: location === "/products" },
    { name: "Silk Sarees", href: "/products?fabric=silk", active: false },
    { name: "Cotton Sarees", href: "/products?fabric=cotton", active: false },
    { name: "Designer", href: "/products?categoryId=designer", active: false },
    { name: "Bridal", href: "/products?occasion=bridal", active: false },
    { name: "Occasion Wear", href: "/products?occasion=party", active: false },
    { name: "New Arrivals", href: "/products?isNew=true", active: false },
    { name: "Sale", href: "/products?isSale=true", active: false, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 glassmorphism border-b border-border">
      {/* Top Banner */}
      <div className="gradient-primary text-center py-2 text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          Free shipping on orders above ₹2,999
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Gem className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-primary">Elegance</h1>
              <p className="text-xs text-muted-foreground">Elegance in Every Thread</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search for silk sarees, bridal collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-full border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                data-testid="input-search"
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-ruby transition-colors"
                data-testid="button-search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <Link
              href="/orders"
              className="hidden md:flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-track-order"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Track Order</span>
            </Link>
            
            <Link
              href="/help"
              className="hidden md:flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-help"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Help</span>
            </Link>

            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-profile"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline text-sm">
                  {user?.firstName || "Profile"}
                </span>
              </Link>
            ) : (
              <a
                href="/api/login"
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-signin"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Sign In</span>
              </a>
            )}

            <Link href="/wishlist" className="relative" data-testid="link-wishlist">
              <Heart className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-ruby text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="text-wishlist-count">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative" data-testid="link-cart">
              <ShoppingBag className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-ruby text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="text-cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="hidden md:flex items-center justify-center mt-4 space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`pb-2 font-medium transition-colors ${
                item.active
                  ? "text-primary border-b-2 border-primary"
                  : item.highlight
                  ? "text-ruby hover:text-ruby"
                  : "text-muted-foreground hover:text-primary"
              }`}
              data-testid={`link-category-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
