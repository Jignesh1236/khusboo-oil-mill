# Online Store

A full-stack multipurpose online store where admin controls everything — store name, logo, categories, products, banners. Users browse, add to cart, and place orders via WhatsApp.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/client run dev` — run the frontend (port 20517)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Zustand (cart)
- Backend: Express 5 + MongoDB (Mongoose)
- Image Storage: Cloudinary
- Auth: IP-based onboarding, JWT admin token
- Routing: Wouter
- State: TanStack Query + Zustand (cart in localStorage)
- Dark mode: next-themes

## Where things live

- `artifacts/client/src/` — React frontend
  - `pages/` — all pages (home, product, cart, wishlist, orders, admin/*)
  - `hooks/use-cart.ts` — Zustand cart store (localStorage)
  - `hooks/use-store-user.ts` — user/admin session from localStorage
  - `components/layout.tsx` — main layout with navbar + bottom nav
  - `components/admin-layout.tsx` — admin sidebar layout
- `artifacts/api-server/src/` — Express backend
  - `models/` — Mongoose models (User, Product, Order, Review, etc.)
  - `routes/` — all API route handlers
  - `lib/mongodb.ts` — MongoDB connection
  - `lib/cloudinary.ts` — Cloudinary upload helper
  - `middleware/adminAuth.ts` — JWT admin middleware
- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks

## Architecture decisions

- Cart is 100% localStorage — no server-side cart, saves DB calls
- IP-based user identification — no registration/login for shoppers
- Admin login via PIN (stored in Config collection, changeable from admin panel)
- All images via Cloudinary — only URLs stored in MongoDB
- WhatsApp ordering — no payment gateway, orders sent as pre-filled WA message

## Product

- Customers: Browse products, filter by category/price, add to cart, checkout via WhatsApp
- Onboarding: First-visit form captures name + source (by IP detection)
- Admin: Full control over products, orders, categories, banners, config, reviews, users

## User preferences

- No payment gateway — WhatsApp + UPI manually
- No login/register — IP-based onboarding
- Admin PIN: configurable from admin panel (default: 1234)
- WhatsApp number: configurable from admin panel
- Store name & logo: configurable from admin panel
- MongoDB + Cloudinary for storage

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes
- Cart uses Zustand + localStorage — clears on new browser/device
- Admin JWT token stored as `adminToken` in localStorage
- User data stored as `storeUser` in localStorage
- ADMIN_PIN, MONGODB_URI, CLOUDINARY_* must be set as secrets

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- Admin panel at `/admin/login` (default PIN: 1234)
