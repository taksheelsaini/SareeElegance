import {
  users,
  categories,
  products,
  productImages,
  reviews,
  cartItems,
  wishlistItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductImage,
  type InsertProductImage,
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type InsertWishlistItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ProductWithImages,
  type ProductWithDetails,
  type CartItemWithProduct,
  type WishlistItemWithProduct,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(filters?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    fabric?: string;
    occasion?: string;
    color?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    isSale?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
  }): Promise<{ products: ProductWithImages[]; total: number }>;
  getProductBySlug(slug: string): Promise<ProductWithDetails | undefined>;
  getProductById(id: string): Promise<ProductWithDetails | undefined>;
  getFeaturedProducts(limit?: number): Promise<ProductWithImages[]>;
  getNewProducts(limit?: number): Promise<ProductWithImages[]>;
  getSaleProducts(limit?: number): Promise<ProductWithImages[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Product images
  createProductImage(image: InsertProductImage): Promise<ProductImage>;
  getProductImages(productId: string): Promise<ProductImage[]>;

  // Reviews
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<void>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Wishlist operations
  getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;

  // Order operations
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  getOrderById(orderId: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    fabric?: string;
    occasion?: string;
    color?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    isSale?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
  } = {}): Promise<{ products: ProductWithImages[]; total: number }> {
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
      limit = 20,
      offset = 0,
      sortBy = 'newest'
    } = filters;

    let query = db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true));

    // Apply filters
    const conditions = [eq(products.isActive, true)];

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (search) {
      conditions.push(
        sql`(${products.name} ILIKE ${`%${search}%`} OR ${products.description} ILIKE ${`%${search}%`})`
      );
    }

    if (minPrice !== undefined) {
      conditions.push(sql`${products.price} >= ${minPrice}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(sql`${products.price} <= ${maxPrice}`);
    }

    if (fabric) {
      conditions.push(eq(products.fabric, fabric));
    }

    if (occasion) {
      conditions.push(eq(products.occasion, occasion));
    }

    if (color) {
      conditions.push(eq(products.color, color));
    }

    if (isNew !== undefined) {
      conditions.push(eq(products.isNew, isNew));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }

    if (isSale !== undefined) {
      conditions.push(eq(products.isSale, isSale));
    }

    // Apply conditions and sorting
    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    } else if (conditions.length === 1) {
      query = query.where(conditions[0]);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        query = query.orderBy(asc(products.price));
        break;
      case 'price-desc':
        query = query.orderBy(desc(products.price));
        break;
      case 'rating':
        query = query.orderBy(desc(products.rating));
        break;
      case 'popular':
        query = query.orderBy(desc(products.reviewCount));
        break;
      case 'newest':
      default:
        query = query.orderBy(desc(products.createdAt));
        break;
    }

    // Get total count
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

    const [{ count: total }] = await totalQuery;

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Get images for products
    const productIds = results.map(r => r.product.id);
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : [];

    // Combine results
    const productsWithImages: ProductWithImages[] = results.map(({ product, category }) => ({
      ...product,
      category: category || undefined,
      images: images.filter(img => img.productId === product.id),
    }));

    return { products: productsWithImages, total };
  }

  async getProductBySlug(slug: string): Promise<ProductWithDetails | undefined> {
    const [result] = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)));

    if (!result) return undefined;

    const [images, productReviews] = await Promise.all([
      this.getProductImages(result.product.id),
      this.getProductReviews(result.product.id),
    ]);

    return {
      ...result.product,
      category: result.category || undefined,
      images,
      reviews: productReviews,
    };
  }

  async getProductById(id: string): Promise<ProductWithDetails | undefined> {
    const [result] = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, id), eq(products.isActive, true)));

    if (!result) return undefined;

    const [images, productReviews] = await Promise.all([
      this.getProductImages(result.product.id),
      this.getProductReviews(result.product.id),
    ]);

    return {
      ...result.product,
      category: result.category || undefined,
      images,
      reviews: productReviews,
    };
  }

  async getFeaturedProducts(limit = 8): Promise<ProductWithImages[]> {
    const results = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    const productIds = results.map(r => r.product.id);
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : [];

    return results.map(({ product, category }) => ({
      ...product,
      category: category || undefined,
      images: images.filter(img => img.productId === product.id),
    }));
  }

  async getNewProducts(limit = 8): Promise<ProductWithImages[]> {
    const results = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.isNew, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    const productIds = results.map(r => r.product.id);
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : [];

    return results.map(({ product, category }) => ({
      ...product,
      category: category || undefined,
      images: images.filter(img => img.productId === product.id),
    }));
  }

  async getSaleProducts(limit = 8): Promise<ProductWithImages[]> {
    const results = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.isSale, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    const productIds = results.map(r => r.product.id);
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : [];

    return results.map(({ product, category }) => ({
      ...product,
      category: category || undefined,
      images: images.filter(img => img.productId === product.id),
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  // Product images
  async createProductImage(image: InsertProductImage): Promise<ProductImage> {
    const [newImage] = await db
      .insert(productImages)
      .values(image)
      .returning();
    return newImage;
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    return await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const results = await db
      .select({
        cartItem: cartItems,
        product: products,
        category: categories,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));

    const productIds = results.map(r => r.product.id);
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : [];

    return results.map(({ cartItem, product, category }) => ({
      ...cartItem,
      product: {
        ...product,
        category: category || undefined,
        images: images.filter(img => img.productId === product.id),
      },
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId)
      ));

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ 
          quantity: (existing.quantity || 0) + (item.quantity || 0),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new item
      const [newItem] = await db
        .insert(cartItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<void> {
    await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ));
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ));
  }

  async clearCart(userId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const results = await db
      .select({
        wishlistItem: wishlistItems,
        product: products,
        category: categories,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));

    const productIds = results.map(r => r.product.id);
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : [];

    return results.map(({ wishlistItem, product, category }) => ({
      ...wishlistItem,
      product: {
        ...product,
        category: category || undefined,
        images: images.filter(img => img.productId === product.id),
      },
    }));
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db
      .insert(wishlistItems)
      .values(item)
      .returning();
    return newItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await db
      .delete(wishlistItems)
      .where(and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      ));
  }

  // Order operations
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const orderIds = userOrders.map(order => order.id);
    
    if (orderIds.length === 0) return [];

    const items = await db
      .select({
        orderItem: orderItems,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    return userOrders.map(order => ({
      ...order,
      items: items
        .filter(item => item.orderItem.orderId === order.id)
        .map(item => ({
          ...item.orderItem,
          product: item.product,
        })),
    }));
  }

  async getOrderById(orderId: string): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) return undefined;

    const items = await db
      .select({
        orderItem: orderItems,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      items: items.map(item => ({
        ...item.orderItem,
        product: item.product,
      })),
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db
      .insert(orderItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }
}

export const storage = new DatabaseStorage();
