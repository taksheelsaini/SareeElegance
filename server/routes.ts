import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProductSchema,
  insertReviewSchema,
  insertCartItemSchema,
  insertWishlistItemSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const {
        categoryId,
        search,
        minPrice,
        maxPrice,
        fabric,
        occasion,
        color,
        isNew,
        isFeatured,
        isSale,
        limit = '20',
        offset = '0',
        sortBy = 'newest'
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        fabric: fabric as string,
        occasion: occasion as string,
        color: color as string,
        isNew: isNew === 'true' ? true : undefined,
        isFeatured: isFeatured === 'true' ? true : undefined,
        isSale: isSale === 'true' ? true : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy: sortBy as 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular',
      };

      const result = await storage.getProducts(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get('/api/products/new', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const products = await storage.getNewProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching new products:", error);
      res.status(500).json({ message: "Failed to fetch new products" });
    }
  });

  app.get('/api/products/sale', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const products = await storage.getSaleProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching sale products:", error);
      res.status(500).json({ message: "Failed to fetch sale products" });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Reviews
  app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/products/:productId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: req.params.productId,
        userId: req.user.claims.sub,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Cart
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });

      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      const userId = req.user.claims.sub;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      await storage.updateCartItem(userId, req.params.productId, quantity);
      res.json({ message: "Cart item updated" });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFromCart(userId, req.params.productId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Wishlist
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const wishlistItemData = insertWishlistItemSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });

      const wishlistItem = await storage.addToWishlist(wishlistItemData);
      res.status(201).json(wishlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wishlist item data", errors: error.errors });
      }
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFromWishlist(userId, req.params.productId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Checkout and Payment
  app.post('/api/checkout/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency = 'inr' } = req.body;
      
      // Create mock payment intent for demo
      const paymentIntent = {
        id: `pi_mock_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method',
        client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post('/api/checkout/create-order', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paymentIntentId, shippingAddress, billingAddress } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
      const shipping = subtotal > 2999 ? 0 : 99;
      const tax = subtotal * 0.18;
      const total = subtotal + shipping + tax;
      
      // Create order
      const orderData = {
        userId,
        orderNumber: `ORD-${Date.now()}`,
        status: 'confirmed',
        subtotal: subtotal.toString(),
        tax: tax.toFixed(2),
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress,
        billingAddress,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        paymentIntentId,
      };
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          total: (parseFloat(item.product.price) * item.quantity).toString(),
        });
      }
      
      // Clear cart
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Orders
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrderById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
