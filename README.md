# SHOP.CO — Frontend Storefront & Admin Panel (Next.js 16 + React 19 + TypeScript + Tailwind)

A modern, responsive, pixel-faithful e-commerce web application featuring a customer-facing storefront and a comprehensive administrative dashboard with granular Role-Based Access Control (RBAC).

Built according to [projects_requirements.md](../projects_requirements.md) from the official SHOP.CO Figma design.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16.4 (App Router with Server & Client Components)
- **UI & Styling**: React 19, TypeScript, Tailwind CSS, Lucide Icons, font: `Satoshi` & `Integral CF`
- **Payments**: Stripe Elements (`@stripe/react-stripe-js` & `@stripe/stripe-js`)
- **State Management**: React Context (`CustomerAuthContext`, `AdminAuthContext`, `CartContext`)

---

## 🛠️ Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the `frontend` root:
```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

*(See `.env.example` for reference).*

### 3. Start Development Server
```bash
npm run dev
# Application starts at http://localhost:3000
```

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🛍️ Storefront Features

- **Homepage (`/`)**: Hero banner with metrics, Brand Marquee, New Arrivals, Top Selling, Browse by Dress Style (Casual, Formal, Party, Gym), Customer Reviews.
- **Product Listing (`/shop`)**: Dynamic keyword search, category selector, price slider, dress styles, and server-side pagination with "Newest Arrivals" sorting.
- **Product Detail (`/product/[id]`)**: Interactive gallery with thumbnail selector, real-time stock indicator, color & size pickers, out-of-stock prevention, related products carousel, and customer reviews.
- **Shopping Cart (`/cart`)**: Quantity stepper, coupon application (`SHOP20`, `FIRST10`), address book selector, and Stripe Elements card checkout.
- **Order Confirmation (`/order-confirmation/[orderNumber]`)**: Dedicated shareable receipt page with line item breakdown, payment status, and shipping destination.
- **My Orders (`/orders`)**: Customer past orders history with real-time fulfillment and payment badges (IDOR protected).
- **Customer Profile (`/profile`)**: Address book management (Home, Office, Custom addresses with default toggle), personal details, and password updates.

---

## 🛡️ Administrative Dashboard

Accessible at `/admin` with separate token isolation and permission-based UI element gating:

- **Dashboard (`/admin`)**: 4 KPI cards (today orders, today revenue, total customers, low-stock alerts), interactive 30-day sales chart, and recent orders table.
- **Products (`/admin/products`)**: Product table with pagination, search, category/stock filters, and modal CRUD supporting multiple image URLs.
- **Categories (`/admin/categories`)**: Hierarchical tree with parent-child relationships and delete protection.
- **Orders (`/admin/orders`)**: Searchable orders list, status filters, and order inspection modal with status transitions.
- **Coupons (`/admin/coupons`)**: Percentage or fixed amount coupons with usage limits and expiry dates.
- **Customer Directory (`/admin/customers`)**: Customer directory showing lifetime spend, order count, and customer order history.
- **Roles & Permissions (`/admin/roles`)**:
  - **Permission Matrix**: Interactive matrix grouped by module (Products, Categories, Orders, Coupons, Roles, Customers, Reports) with Super Admin immutability.
  - **Staff Directory**: Staff account management and role assignments.
- **Staff Profile (`/admin/profile`)**: Staff profile info and password management.

---

## 💳 Stripe Test Cards

| Scenario | Card Number | MM/YY | CVC | Expected Behavior |
|:---|:---|:---:|:---:|:---|
| **Success** | `4242 4242 4242 4242` | Any future | `123` | Payment succeeds, stock decremented, redirects to confirmation receipt |
| **Card Declined** | `4000 0000 0000 0002` | Any future | `123` | Declined error message displayed, order remains unpaid |
