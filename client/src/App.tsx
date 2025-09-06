import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {isLoading ? (
            <Route path="/">
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            </Route>
          ) : !isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/products" component={Products} />
              <Route path="/products/:slug" component={ProductDetail} />
              <Route component={NotFound} />
            </>
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/products" component={Products} />
              <Route path="/products/:slug" component={ProductDetail} />
              <Route path="/cart" component={Cart} />
              <Route path="/wishlist" component={Wishlist} />
              <Route path="/profile" component={Profile} />
              <Route path="/orders" component={Profile} />
              <Route component={NotFound} />
            </>
          )}
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
