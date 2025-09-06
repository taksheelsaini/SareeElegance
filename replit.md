# Overview

Elegance is a premium e-commerce platform specifically designed for selling traditional Indian sarees. The platform combines modern web technologies with a focus on luxury retail, offering features like product browsing, wishlist management, shopping cart functionality, and user authentication. The application is built as a full-stack solution with a React-based frontend and Express.js backend, targeting customers seeking high-quality, authentic sarees for various occasions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript, leveraging a modern component-based architecture. The UI is constructed using Shadcn/UI components with Radix UI primitives, providing accessible and customizable interface elements. Styling is handled through Tailwind CSS with a custom design system featuring feminine color palettes (mocha mousse and pink accents) and glassmorphism effects.

The frontend follows a page-based routing structure using Wouter for client-side navigation. State management is handled through TanStack Query for server state and React hooks for local state. The application implements a responsive design system optimized for desktop, tablet, and mobile experiences.

Key architectural decisions include:
- Component isolation with reusable UI elements
- Custom styling system with CSS variables for theming
- Query-based data fetching with caching and invalidation
- Authentication-aware routing and component rendering

## Backend Architecture
The server-side application uses Express.js with TypeScript, implementing a RESTful API architecture. The backend follows a layered pattern with clear separation between routes, business logic, and data access layers.

Authentication is handled through Replit's OpenID Connect integration with session-based state management. The API endpoints are organized around resource-based routing (products, categories, cart, wishlist, orders) with consistent error handling and logging middleware.

The storage layer abstracts database operations through a dedicated storage service, providing a clean interface for data access operations across different entities.

## Data Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database interactions. The schema is designed around core e-commerce entities with proper relationships and constraints.

Database design includes:
- Users table with profile information
- Product catalog with categories, images, and metadata
- Shopping cart and wishlist functionality
- Order management with line items
- Review and rating system
- Session storage for authentication state

The schema supports advanced filtering and search capabilities through indexed fields and relationship queries.

## Authentication & Authorization
Authentication is implemented using Replit's OIDC provider with JWT token validation. The system supports session-based state management with PostgreSQL session storage for persistence across requests.

Authorization is handled through middleware that validates user authentication status and provides user context to protected routes. The frontend implements authentication-aware routing that redirects unauthenticated users to appropriate login flows.

# External Dependencies

## Database Services
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication Services
- **Replit OIDC**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express
- **JWT**: JSON Web Tokens for secure authentication

## UI & Styling
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating variant-based component APIs

## Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type-safe JavaScript development
- **ESBuild**: Fast JavaScript bundler for production builds
- **React Query (TanStack Query)**: Server state management and caching

## Runtime & Deployment
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Wouter**: Lightweight client-side routing
- **WebSocket**: Real-time communication support through Neon serverless