# AavyaRath — Backend API

> RESTful API server for the AavyaRath home decor e-commerce platform. Built with Node.js, Express, and MongoDB — featuring JWT authentication, Razorpay payment integration, and transactional email.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-072654?logo=razorpay)
![JWT](https://img.shields.io/badge/Auth-JWT_+_Google_OAuth-orange)

**Frontend Repository:** [github.com/your-username/aavyarath-frontend](https://github.com/your-username/aavyarath-frontend)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Payment Flow](#payment-flow)
- [Order Lifecycle](#order-lifecycle)
- [Email System](#email-system)
- [Validation](#validation)
- [Project Structure](#project-structure)

---

## Overview

This is the Express.js backend that powers the AavyaRath storefront and admin panel. It exposes a JSON REST API under `/api` and handles:

- User registration, login, and Google OAuth
- Product catalog with categories, reviews, and full-text search
- Cart management (authenticated users and guests)
- Multi-step checkout with Razorpay payment verification
- Order management with status history and shipping tracking
- Coupon/discount engine (percentage, flat, free shipping)
- Admin panel endpoints (products, orders, categories, customers, coupons)
- Transactional emails (order confirmation, status updates)
- File uploads (product images via Multer)
- Auto-seeding of sample data for development

**Demo admin credentials** (auto-created on first seed):

| Email | Password | Role |
|-------|----------|------|
| `admin@artisanhome.com` | `Admin@123` | superadmin |

---

## Architecture

```
Request → Express Router → Middleware (Auth / Validate) → Controller → Service → MongoDB
                                                                              ↓
                                                                     Email Service (async)
```

The codebase follows a strict **Controller → Service** separation:

- **Controllers** handle HTTP — parse request, call service, send response
- **Services** contain all business logic, DB queries, and side-effects
- **Middleware** handles cross-cutting concerns (auth, validation, error handling)
- **Validators** are Joi schemas imported by the validate middleware
- **Models** are Mongoose schemas — no business logic

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 4.18 |
| **Database** | MongoDB via Mongoose 8 |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Google OAuth** | google-auth-library (ID token verification) |
| **Payments** | Razorpay SDK, HMAC-SHA256 signature verification |
| **Email** | Nodemailer (SMTP) |
| **Validation** | Joi 18 |
| **File Upload** | Multer (disk storage, 5MB limit, images only) |
| **IDs** | UUID v4 |
| **Dev** | nodemon |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas)
- npm 9+

### Installation

**1. Clone and navigate to the backend directory**
```bash
git clone https://github.com/your-username/aavyarath.git
cd aavyarath/backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your values — see Environment Variables section below
```

**4. Start development server**
```bash
npm run dev
# Starts with nodemon on http://localhost:8001
```

**5. Seed the database**

On first run, the frontend automatically calls `POST /api/seed`. You can also trigger it manually:
```bash
curl -X POST http://localhost:8001/api/seed
```

This creates 5 categories, 8 products, 5 FAQs, 1 sample coupon (`WELCOME10`), and the default admin account.

**6. Start production server**
```bash
npm start
```

---

## Environment Variables

Create a `.env` file in the backend root:

```env
# ── Server ───────────────────────────────────────────────
PORT=8001
NODE_ENV=development

# ── Database ─────────────────────────────────────────────
MONGO_URL=mongodb://localhost:27017
DB_NAME=aavyarath

# ── Authentication ────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here

# ── Google OAuth (optional) ───────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ── Razorpay (optional — falls back to mock in dev) ───────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# ── CORS ─────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000

# ── Frontend URL (used in email links) ───────────────────
FRONTEND_URL=http://localhost:3000

# ── Email / SMTP (optional — emails logged if not set) ────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="AavyaRath" <no-reply@aavyarath.com>
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `8001`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGO_URL` | ✅ Yes | MongoDB connection string |
| `DB_NAME` | ✅ Yes | MongoDB database name |
| `JWT_SECRET` | ✅ Yes | Secret for signing JWTs (use a long random string in prod) |
| `GOOGLE_CLIENT_ID` | No | Required only if using Google OAuth |
| `RAZORPAY_KEY_ID` | No | Required for live payments; falls back to mock in dev |
| `RAZORPAY_KEY_SECRET` | No | Required for live payments and signature verification |
| `CORS_ORIGINS` | No | Comma-separated list of allowed origins (default: `*`) |
| `FRONTEND_URL` | No | Used to generate links in emails |
| `EMAIL_HOST` | No | SMTP host; emails are logged to console if not set |
| `EMAIL_PORT` | No | SMTP port (default: `587`) |
| `EMAIL_SECURE` | No | `true` for port 465, `false` for 587 |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password or app password |
| `EMAIL_FROM` | No | Sender address for outgoing emails |

> **Note:** In development, if `RAZORPAY_KEY_SECRET` is not set, the payment service returns a mock Razorpay order and `verifyPayment` skips signature checking. Similarly, if SMTP credentials are absent, emails are printed to the console instead of sent.

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | Public | Create a new customer account |
| `POST` | `/login` | Public | Login with email and password |
| `GET` | `/me` | 🔑 Token | Get current authenticated user |
| `POST` | `/google` | Public | Verify Google ID token, login or register |
| `POST` | `/forgot-password` | Public | Initiate password reset |
| `POST` | `/reset-password` | Public | Complete password reset with token |

### Categories — `/api/categories`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | List all active categories with product counts |
| `GET` | `/:slug` | Public | Get single category by slug |

### Products — `/api/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | List products with filters, search, sort, pagination |
| `GET` | `/featured` | Public | Get featured products |
| `GET` | `/new-arrivals` | Public | Get new arrival products |
| `GET` | `/bestsellers` | Public | Get best-selling products |
| `GET` | `/:slug` | Public | Get product detail by slug (includes reviews) |
| `GET` | `/:product_id/related` | Public | Get related products by category |
| `POST` | `/:product_id/reviews` | 🔑 Token | Submit a product review |

**Product list query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category slug |
| `search` | string | Full-text search on name, description, tags |
| `min_price` | number | Minimum price filter |
| `max_price` | number | Maximum price filter |
| `in_stock` | boolean | Only show in-stock products |
| `sort` | string | `newest` \| `oldest` \| `price-low` \| `price-high` \| `bestseller` \| `rating` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12, max: 100) |

### Cart — `/api/cart`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Optional | Get cart (user or guest via `?cart_id=`) |
| `POST` | `/add` | Optional | Add item to cart |
| `PATCH` | `/:product_id` | 🔑 Token | Update item quantity |
| `DELETE` | `/:product_id` | 🔑 Token | Remove item from cart |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | 🔑 Token | Place a new order |
| `GET` | `/` | 🔑 Token | List user's orders (filterable by status) |
| `GET` | `/:order_id` | 🔑 Token | Get full order detail |
| `GET` | `/:order_id/tracking` | Public | Get tracking info (no auth required) |

### Payment — `/api/payment`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/create-order` | 🔑 Token | Create a Razorpay order |
| `POST` | `/verify` | 🔑 Token | Verify Razorpay payment signature |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/profile` | 🔑 Token | Get user profile |
| `PATCH` | `/profile` | 🔑 Token | Update name / phone |
| `GET` | `/addresses` | 🔑 Token | List saved addresses |
| `POST` | `/addresses` | 🔑 Token | Add a new address |
| `DELETE` | `/addresses/:address_id` | 🔑 Token | Delete an address |
| `PATCH` | `/change-password` | 🔑 Token | Change password |

### Wishlist — `/api/wishlist`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | 🔑 Token | Get wishlist items |
| `POST` | `/:product_id` | 🔑 Token | Add product to wishlist |
| `DELETE` | `/:product_id` | 🔑 Token | Remove product from wishlist |

### Coupons — `/api/coupons`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/validate` | Optional | Validate a coupon code against a cart total |

### Content — `/api/content`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/contact` | Public | Submit a contact form |
| `POST` | `/newsletter` | Public | Subscribe to newsletter |
| `GET` | `/faqs` | Public | Get all FAQs |
| `GET` | `/blog` | Public | List blog posts |
| `GET` | `/blog/:slug` | Public | Get a single blog post |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | 🔑 Token | Upload an image (max 5MB, JPEG/PNG/WebP/GIF) |

Returns: `{ "url": "/uploads/<filename>" }`. Files are served statically at `/uploads/<filename>`.

### Admin — `/api/admin` (🔑 Token + Admin role required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/dashboard/stats` | Revenue, orders, customers, low-stock counts |
| `GET` | `/orders` | Paginated order list with optional status filter |
| `PATCH` | `/orders/:order_id/status` | Update fulfillment status + tracking info |
| `GET` | `/products` | Paginated admin product list |
| `POST` | `/products` | Create a product |
| `PUT` | `/products/:product_id` | Update a product |
| `DELETE` | `/products/:product_id` | Delete a product |
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create a category |
| `PUT` | `/categories/:category_id` | Update a category |
| `DELETE` | `/categories/:category_id` | Delete a category (blocked if it has products) |
| `GET` | `/customers` | Paginated customer list with order stats |
| `GET` | `/coupons` | List all coupons |
| `POST` | `/coupons` | Create a coupon |
| `DELETE` | `/coupons/:coupon_id` | Delete a coupon |

### Seed — `/api/seed` (development only)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Seed database with categories, products, FAQs, coupon, and admin user |

> The seed route is **disabled in production** (`NODE_ENV=production`).

---

## Data Models

### User
```
user_id, email, name, phone, password_hash, role (customer/admin/superadmin),
profile_image, saved_addresses[], is_active, created_at, updated_at
```

### Product
```
product_id, name, slug, sku, short_description, description, images[],
category_id, tags[], price, compare_at_price, cost_price, stock,
low_stock_threshold, specifications[{key,value}], status (active/inactive/draft),
is_featured, is_new_arrival, is_sale, rating_average, rating_count,
sales_count, meta_title, meta_description, created_at, updated_at
```

### Order
```
order_id, order_number, user_id, items[{product_id, name, image, price, quantity, total}],
shipping_address, payment_method, payment_status (pending/completed/failed/refunded),
fulfillment_status (pending/processing/shipped/delivered/cancelled),
status_history[{status, note, changed_at}], tracking_number, courier_partner,
estimated_delivery, subtotal, shipping_cost, tax, discount, total,
coupon_code, razorpay_order_id, razorpay_payment_id, created_at, updated_at
```

### Category
```
category_id, name, slug, description, description_long, image, parent_category,
status (active/inactive), created_at, updated_at
```

### Coupon
```
coupon_id, code (uppercase), type (percentage/flat/freeshipping), value,
min_order_value, max_discount_cap, usage_limit, usage_limit_per_user,
usage_count, valid_from, valid_to, applicable_categories[], is_active,
created_at, updated_at
```

### Cart
```
cart_id, user_id (null for guests), items[{product_id, quantity}],
created_at, updated_at
```

### Review
```
review_id, product_id, user_id, user_name, rating (1–5), title, body,
is_verified_purchase, helpful_votes, created_at, updated_at
```

### Wishlist
```
user_id (unique), product_ids[], created_at, updated_at
```

---

## Authentication

The API uses **JWT Bearer tokens**. Include the token in every protected request:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are signed with `JWT_SECRET` and expire after **24 hours**.

### Middleware

| Middleware | Behaviour |
|-----------|-----------|
| `verifyToken` | Required auth — returns `401` if token missing/invalid |
| `verifyTokenOptional` | Sets `req.user` if a valid token is provided, otherwise `req.user = null` (used for cart/coupon endpoints that work for guests too) |
| `requireAdmin` | Must follow `verifyToken` — returns `403` if user is not `admin` or `superadmin` |

### Google OAuth flow

```
1. Frontend receives Google credential (id_token) from Google Sign-In
2. Frontend POST /api/auth/google  { id_token }
3. Backend verifies token with google-auth-library using GOOGLE_CLIENT_ID
4. Creates user on first login (no password), or updates profile picture on return
5. Returns { token, user } — same shape as email/password login
```

---

## Payment Flow

### Online payment (UPI, card, netbanking)

```
1. POST /api/orders          → Creates order (payment_status: pending), does NOT deduct stock
2. POST /api/payment/create-order  → Creates a Razorpay order (amount in paise)
3. Frontend opens Razorpay checkout modal
4. On payment success, Razorpay calls handler with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
5. POST /api/payment/verify  → Verifies HMAC-SHA256 signature
6. On verification success:
   - Order payment_status → "completed"
   - Stock is deducted for each item
   - Cart is cleared
   - Confirmation email is sent
```

### Cash on Delivery

```
1. POST /api/orders   → Creates order, immediately deducts stock, clears cart, sends email
```

### Ghost orders

Online payment orders that are never verified (user closed the tab) remain `payment_status: "pending"`. These **ghost orders** are hidden from both the buyer's order history and the admin panel via a shared `ghostOrderFilter`. They do not affect stock or cart.

---

## Order Lifecycle

```
pending → processing → shipped → delivered
             ↓
          cancelled  (allowed from pending or processing only)
```

- **pending** — order placed, awaiting action
- **processing** — admin has acknowledged and is preparing the order
- **shipped** — dispatched; tracking number and courier partner are recorded at this stage
- **delivered** — order received by customer
- **cancelled** — admin or system cancellation; online payments trigger a refund note

Every status change is appended to `order.status_history` (with an optional admin note), giving the buyer a full timeline visible in the tracking page.

---

## Email System

Emails are sent asynchronously (fire-and-forget) so they never block the API response. If SMTP credentials are not configured, messages are printed to the console instead — useful for development.

### Templates

| Trigger | Template | Recipients |
|---------|----------|------------|
| COD order placed | `orderConfirmation` | Customer |
| Online payment verified | `orderConfirmation` | Customer |
| Admin updates order status | `orderStatusUpdate` | Customer |

Both templates use a shared HTML wrapper with the AavyaRath brand colours and include a full items table, totals breakdown, and a CTA button linking to the order page. The `orderStatusUpdate` template additionally shows tracking number, courier partner, and estimated delivery when the status is `shipped`.

---

## Validation

All request bodies and query strings are validated using **Joi** schemas via the `validate(schema, source?)` middleware before they reach a controller. On failure the response is:

```json
{
  "detail": "Validation failed",
  "errors": [
    { "field": "phone", "message": "Please enter a valid 10-digit Indian mobile number" }
  ]
}
```

Unknown fields are stripped and type coercion is applied automatically (`"1"` → `1`, `"true"` → `true`).

### Key validation rules

| Field | Rule |
|-------|------|
| Password | Min 8 chars, must contain uppercase, lowercase, and a number |
| Phone | 10-digit Indian mobile (`[6-9]\d{9}`) |
| Pincode | Exactly 6 digits |
| Product slug | Lowercase letters, numbers, hyphens only |
| Coupon code | Alphanumeric, auto-uppercased |
| Compare price | Must be greater than selling price |
| Review body | Min 10 characters |

---

## Error Handling

All async route handlers are wrapped with `asyncHandler` so thrown errors are automatically forwarded to the central `errorHandler` middleware. Error responses always follow the same shape:

```json
{ "detail": "Human-readable error message" }
```

| HTTP Status | When |
|-------------|------|
| `400` | Bad request (business logic error, e.g. insufficient stock) |
| `401` | Missing, invalid, or expired JWT |
| `403` | Valid token but insufficient permissions (non-admin on admin routes) |
| `404` | Resource not found |
| `409` | Duplicate key (e.g. email already registered, duplicate slug) |
| `422` | Joi validation failure |
| `500` | Unexpected server error |

---

## Project Structure

```
backend/
├── server.js                   # Entry point — Express app setup
├── config/
│   ├── db.js                   # MongoDB connection
│   └── email.js                # Nodemailer transporter instance
├── middleware/
│   ├── auth.js                 # verifyToken, verifyTokenOptional, requireAdmin
│   ├── errorHandler.js         # Central error handler + asyncHandler wrapper
│   └── validate.js             # Joi validation middleware factory
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Coupon.js
│   ├── Review.js
│   ├── Wishlist.js
│   └── Misc.js                 # Contact, Newsletter, FAQ, BlogPost
├── controllers/
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── category.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   ├── user.controller.js
│   ├── wishlist.controller.js
│   ├── coupon.controller.js
│   ├── content.controller.js
│   └── admin.controller.js
├── services/
│   ├── auth.service.js         # Register, login, Google OAuth
│   ├── product.service.js      # Catalog, search, reviews, related
│   ├── category.service.js
│   ├── cart.service.js         # Guest + user cart, stock check
│   ├── order.service.js        # Checkout, ghost order logic, tracking
│   ├── payment.service.js      # Razorpay create + verify
│   ├── user.service.js         # Profile, addresses, password
│   ├── wishlist.service.js
│   ├── coupon.service.js       # Coupon validation and discount calc
│   ├── content.service.js      # FAQs, contact, newsletter, blog
│   ├── admin.service.js        # All admin operations
│   └── email.service.js        # Templates + sendEmail helper
├── routes/
│   ├── index.js                # Central router — mounts all sub-routers
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── category.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   ├── user.routes.js
│   ├── wishlist.routes.js
│   ├── coupon.routes.js
│   ├── content.routes.js
│   ├── admin.routes.js
│   ├── upload.routes.js
│   └── seed.routes.js          # Dev only — disabled in production
├── validators/
│   ├── auth.validators.js
│   ├── product.validators.js
│   ├── order.validators.js
│   ├── admin.validators.js
│   ├── user.validators.js
│   └── content.validators.js
└── uploads/                    # Served statically at /uploads/*
```

---

## License

This project is for educational and personal use.

---

*AavyaRath Backend · Faridabad, Haryana, India · Built with Node.js + Express + MongoDB*