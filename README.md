# Melt & Magic - 3D Ice Cream Shop (Frontend)

The website and admin panel for **Melt & Magic**, a small-batch ice cream shop in Colombo.
Every treat on the site (cones, cups, sticks, sundaes, shakes and sandwiches) is a real-time
3D model generated in code, so the project needs no 3D files.

Built with **React 18 + TypeScript + Tailwind CSS + Three.js**. Prices are in **Sri Lankan rupees (Rs)**.

> **Status:** the frontend is complete. It runs on a **built-in mock API** that saves data in the
> browser. The real backend (NestJS + Prisma + PostgreSQL) is a separate project, and the frontend
> switches to it with one setting (see [Connecting the backend](#8-connecting-the-backend)).

---

## Contents

1. [Features](#1-features)
2. [Quick start](#2-quick-start)
3. [Environment variables](#3-environment-variables)
4. [Pages](#4-pages)
5. [Tech stack](#5-tech-stack)
6. [Project structure](#6-project-structure)
7. [Styling and customising](#7-styling-and-customising)
8. [Connecting the backend](#8-connecting-the-backend)
9. [The melt experience](#9-the-melt-experience)
10. [How the 3D works](#10-how-the-3d-works)
11. [Build and deploy](#11-build-and-deploy)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Features

**Shop (customer side)**
- **"A world that melts with you"**: as you scroll, the 3D scoop melts, drips down the cone and floods
  the screen, and the melted cream pours into each next section (see [The melt experience](#9-the-melt-experience))
- Full menu with category tabs, search and sorting (featured, price low/high, A–Z)
- 360° product viewer: drag to spin, scroll to zoom
- Build-your-own: pick a cone or cup, drop up to 3 scoops, add toppings, live price
- Cart drawer, checkout form and order confirmation (with confetti)
- Frosted-glass card design over soft pastel colours
- Closed-shop mode: ordering pauses and a notice is shown

**Admin panel**
- Dashboard with stat boxes, menu-by-kind chart, low-stock list and recent orders
- Products: add, edit, copy, delete, show/hide, with a **live 3D preview** while editing
- Orders: filter by status and update each order's status
- Settings: announcement bar, hero headline, featured product, theme colour, open/closed
- Protected by JWT login

---

## 2. Quick start

Requires **Node.js 20 or newer**.

```bash
npm install
cp .env.example .env      # PowerShell: copy .env.example .env
npm run dev
```

Open **http://localhost:5173**.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |

### Admin login

Go to **http://localhost:5173/admin**.

| Email | Password |
|---|---|
| `admin@meltandmagic.lk` | `scoop123` |

This demo login works only in mock mode. With the real backend, use an admin account from its database.

---

## 3. Environment variables

Set in `.env` (copy it from `.env.example`). Restart `npm run dev` after any change.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_USE_MOCK` | `true` | `true`: use the built-in mock API (data stays in this browser). `false`: call the real backend. |
| `VITE_API_URL` | `http://localhost:3000/api` | Base URL of the NestJS API. Used only when `VITE_USE_MOCK=false`. |

### About mock mode

The mock API in `src/api/mock.ts` mirrors the real REST endpoints exactly and saves everything in
the browser's localStorage:

| localStorage key | Holds |
|---|---|
| `scoopverse-mockdb-v2` | Products, orders and settings |
| `scoopverse-cart-lkr` | The shopping cart |
| `scoopverse-auth` | The admin login token |

To start over with the original menu, use **Admin → Settings → Reset demo data**, or clear the site
data in your browser. The starter menu lives in `src/data/seed.ts`.

---

## 4. Pages

| Route | Page |
|---|---|
| `/` | Home: melting 3D hero → kinds of treats → this week's picks → reviews → build-your-own teaser → visit us (chocolate section), joined by melt transitions |
| `/shop` | Full menu. Filter by kind with `?type=cone` (or `cup`, `stick`, `sundae`, `shake`, `sandwich`) |
| `/build` | Build your own cone or cup in 3D |
| `/checkout` | Order form → confirmation |
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard |
| `/admin/products` | Product list and editor |
| `/admin/orders` | Orders and status updates |
| `/admin/settings` | Website settings |

Any other URL shows the 404 page.

---

## 5. Tech stack

| Area | Library |
|---|---|
| UI | React 18, TypeScript (strict mode) |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 + shared classes in `src/index.css` |
| 3D | three.js, @react-three/fiber, @react-three/drei |
| Scroll animation | GSAP 3 + ScrollTrigger |
| Routing | react-router-dom 6 (pages are lazy-loaded) |
| State | zustand (cart, auth, shop data, UI) |
| HTTP | axios (adds the JWT, turns NestJS errors into readable messages) |

---

## 6. Project structure

```
src/
├── api/
│   ├── client.ts        axios instance, JWT header, error messages, USE_MOCK flag
│   ├── services.ts      one function per REST endpoint (pages only call these)
│   └── mock.ts          in-browser mock of the whole API
├── components/          Navbar, Footer, AnnouncementBar, ProductCard, ProductViewer,
│   │                    CartDrawer, Overlay (drawer/modal), ConfirmDialog, Toast, Loader…
│   └── melt/
│       ├── MeltDivider.tsx     scroll-driven section transitions: drip / splash / wave
│       ├── MeltRail.tsx        cream drip down the left edge that grows with scroll
│       └── FloatingSweets.tsx  floating sprinkles and cream drops (2D canvas)
├── data/
│   ├── constants.ts     kinds, flavours, toppings, theme colours, delivery rules, money()
│   └── seed.ts          starter menu and default settings
├── lib/gsap.ts          GSAP + ScrollTrigger setup, reduced-motion check, easing helpers
├── hooks/               useAddToCart, useAsync, useReveal, useAccent
│                        (useTilt is no longer used by any page)
├── layouts/
│   ├── SiteLayout.tsx   shop layout: announcement bar, navbar, footer, cart, melt rail,
│   │                    floating sweets; refreshes ScrollTrigger when page height changes
│   └── AdminLayout.tsx  admin layout (sidebar, top bar) + PageHead
├── pages/               Home, Shop, Builder, Checkout, NotFound
│   └── admin/           Login, Overview, Products, ProductEditor, Orders, SettingsPage
├── store/               auth.ts, cart.ts, shop.ts, ui.ts   (zustand stores)
├── three/               builders.ts (all 3D models), IceCream.tsx, HeroStory.tsx,
│                        MeltScene.tsx (melting hero), BuilderScene.tsx, thumbnails.ts
├── types/index.ts       Product, Order, Settings and DTO types (mirror the backend)
└── index.css            Tailwind layers, shop classes, melt hover effects and admin classes
```

Imports use the `@/` alias for `src/`, for example `import { money } from '@/data/constants'`.

---

## 7. Styling and customising

The shop and the admin panel deliberately use **two different styles**.

### Shop: glass style

| Where | What to change |
|---|---|
| `tailwind.config.js` | Colours (`ink`, `cream`, `paper`, `butter`, `mint`, `danger`), fonts, corner radius, shadows |
| `src/index.css` → `:root` | Flavour palette (`--strawberry`, `--vanilla`, `--mint`, `--mango`, `--choco`) and `--melt`, the colour of melted cream |
| `src/index.css` → `body::before` | The pastel colour washes behind the page |
| `src/index.css` → `.glass` | Card transparency. Raise `bg-white/45` (e.g. `/60`) for more solid cards, lower it for more see-through |
| `src/index.css` → `.btn-*`, `.input`, `.chip`, `.seg` | Buttons and form controls |
| `index.html` | Google Fonts: Bricolage Grotesque (headings), Karla (text), Courier Prime (labels) |

The **accent colour** (pink by default) is chosen by the admin in **Settings → Theme colour** and
applied through the `--accent` CSS variable, so it updates the whole shop without a rebuild.
The list of colours is `ACCENTS` in `src/data/constants.ts`.

### Admin: standard dashboard style

All admin styles are in `src/index.css` under the **"Admin panel"** comment and only apply inside
the `.admin` wrapper, so they never affect the shop. The colours are variables at the top of that block:

```css
--primary: #1e3a5f; --success: #198754; --warning: #ffc107; --danger: #dc3545;
```

The sidebar, dashboard stat boxes, primary buttons and highlights all use the one navy (`#1e3a5f`).
Status badges keep their own colours (green, yellow, red) because the colour tells you the status.

Reusable admin classes: `card`, `card-header`, `card-body`, `stat`, `table`,
`badge-primary|secondary|success|warning|danger|info`, `btn-sm-primary|secondary|danger`,
`form-text`, `alert-warning`.

### Prices and delivery

- All money is formatted by `money()` in `src/data/constants.ts`, e.g. `Rs 1,450`.
- Delivery: `DELIVERY_FEE = 350`, free over `FREE_DELIVERY_OVER = 4000` (same file).
- Menu prices are in `src/data/seed.ts`; build-your-own prices are at the top of `src/pages/Builder.tsx`.

### Shop name and contact details

| Text | File |
|---|---|
| Shop name in navbar, footer, admin | `Navbar.tsx`, `Footer.tsx`, `AdminLayout.tsx`, `admin/Login.tsx` |
| Browser tab title and description | `index.html` |
| Address, hours, phone, reviews | `src/pages/Home.tsx` |
| Announcement bar text | Admin → Settings (default in `src/data/seed.ts`) |

---

## 8. Connecting the backend

1. Start the NestJS API with the global prefix `api` and CORS allowed for `http://localhost:5173`.
2. In `.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_USE_MOCK=false
   ```
3. Restart `npm run dev`. No component changes are needed, because every page goes through `src/api/services.ts`.

### REST contract

| Method | Endpoint | Auth | Request → Response |
|---|---|---|---|
| POST | `/auth/login` | – | `{ email, password }` → `{ accessToken, admin: { id, email, name } }` |
| GET | `/products?type=&search=` | – | → `Product[]` (only `active`, sorted by `sortOrder`) |
| GET | `/products/admin` | JWT | → `Product[]` (all, including hidden) |
| GET | `/products/:id` | – | → `Product` |
| POST | `/products` | JWT | `CreateProductDto` → `Product` |
| PATCH | `/products/:id` | JWT | `UpdateProductDto` (partial) → `Product` |
| DELETE | `/products/:id` | JWT | → `{ success: true }` |
| POST | `/orders` | – | `CreateOrderDto` → `Order` |
| GET | `/orders` | JWT | → `Order[]`, newest first |
| PATCH | `/orders/:id/status` | JWT | `{ status }` → `Order` |
| GET | `/settings` | – | → `Settings` |
| PATCH | `/settings` | JWT | `Partial<Settings>` → `Settings` |

Rules the frontend relies on:

- The JWT is sent as `Authorization: Bearer <token>`. Any `401` response logs the admin out.
- On `POST /orders` the **server** calculates `subtotal`, `deliveryFee` (Rs 350, free over Rs 4,000)
  and `total`, and reduces stock.
- Validation errors in the usual `class-validator` shape (`{ message: string[] }`) are shown to the user as-is.
- All prices are **whole rupees**.
- Exact field names and enum values are in `src/types/index.ts`.

### Suggested Prisma schema

```prisma
enum IceCreamType  { cone cup stick sundae shake sandwich }
enum Topping       { none sprinkles chips nuts }
enum Sauce         { none chocolate caramel strawberry }
enum OrderStatus   { NEW PREPARING OUT_FOR_DELIVERY DELIVERED CANCELLED }
enum PaymentMethod { CASH CARD }

model Product {
  id          String       @id @default(uuid())
  name        String
  description String       @default("")
  type        IceCreamType
  flavours    String[]     // hex colours, bottom → top (1–3)
  topping     Topping      @default(none)
  sauce       Sauce        @default(none)
  cherry      Boolean      @default(false)
  wafer       Boolean      @default(false)
  price       Int          // whole rupees
  stock       Int          @default(0)
  badge       String?
  featured    Boolean      @default(false)
  active      Boolean      @default(true)
  sortOrder   Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Order {
  id            String        @id
  customerName  String
  phone         String
  address       String
  paymentMethod PaymentMethod
  items         Json          // OrderItem[] { productId, name, quantity, unitPrice, spec }
  subtotal      Int
  deliveryFee   Int
  total         Int
  status        OrderStatus   @default(NEW)
  createdAt     DateTime      @default(now())
}

model Settings {
  id                Int     @id @default(1)
  announcement      String
  heroLine          String  @default("")
  featuredProductId String?
  accent            String  @default("#E8457A")
  isOpen            Boolean @default(true)
}

model Admin {
  id           String @id @default(uuid())
  email        String @unique
  name         String
  passwordHash String
}
```

The starter menu in `src/data/seed.ts` can be copied into the backend's `prisma/seed.ts`.

---

## 9. The melt experience

The home page is one continuous melt. Each piece hands its colour to the next, so there are no hard cuts.

| Where | What happens | Code |
|---|---|---|
| Hero | The scoop slowly melts even at rest. Scrolling slumps it over the rim, stretches drips out of it, runs cream down the cone, and drops fall and splash into a growing puddle. The camera follows the melt down and the cream floods up from the bottom of the screen. | `three/MeltScene.tsx`, `three/HeroStory.tsx` |
| Hero → Shop | The flood continues as a band of cream that pours long drips down behind the collection. | `<MeltDivider variant="drip" />` |
| Shop → Build | Strawberry, vanilla, mint, mango and chocolate splat and fling droplets, then shrink away. | `<MeltDivider variant="splash" />` |
| Build → Visit | Vanilla, caramel and chocolate rise as waves and fill into the chocolate Visit section. | `<MeltDivider variant="wave" />` |
| Visit → Footer | The chocolate keeps dripping into the footer. | `<MeltDivider variant="drip" color="#5A2A12" reach={0.5} />` |
| Every shop page | A cream "drip" down the left edge grows with scroll; sprinkles and cream drops float behind the page and move away from the mouse. | `melt/MeltRail.tsx`, `melt/FloatingSweets.tsx` |
| Hover | Cards drip from the top, flavour swatches grow a drop, treats wobble like jelly. | `.melt-hover`, `.swatch-drip`, `animate-jelly` in `index.css` / `tailwind.config.js` |

**How it's built**

- **Melting scoop:** a vertex shader injected into the normal cream material (`onBeforeCompile`).
  It sinks the top, spreads the middle, pulls drip lobes down and recomputes normals, so the
  lighting follows the drips. Strands, drops, splashes and sprinkles are instanced meshes updated each frame.
- **Transitions:** SVG paths rebuilt each frame from scroll progress (GSAP ScrollTrigger). The splash
  uses an SVG "goo" filter so blobs merge like liquid. Drawing only runs while a divider is on screen.
- **Flavour colour:** picking a flavour in the hero sets the `--melt` CSS variable, so the flood and the
  first drips change colour with it.
- **Performance:** the hero canvas stops rendering once you scroll past it, pixel ratio is capped,
  particle counts scale with screen size, and background tabs pause the particles.
- **Reduced motion:** visitors with "reduce motion" turned on get the finished state of each
  transition and no floating particles.

To tune it: melt strength is in `MELT_GLSL` (`MeltScene.tsx`); drip count, width and length are in
`makeSeeds` (`MeltDivider.tsx`); divider heights are in the `sizes` map there.

## 10. How the 3D works

- **`three/builders.ts`** turns a `ModelSpec` (`type`, `flavours`, `topping`, `sauce`, `cherry`, `wafer`)
  into a Three.js object: cone, cup and glass bodies, scoops, sprinkles, chips, nuts,
  dripping sauce, whipped cream, a cherry and a straw.
- **`IceCream.tsx`** wraps it for React Three Fiber. `ProductStage` adds orbit controls and a shadow.
- **`thumbnails.ts`** renders every card image with **one** hidden WebGL renderer, so long product grids stay fast.
- **`HeroStory.tsx` / `MeltScene.tsx`**: the home page story. A 560vh section with a sticky canvas;
  scroll position (0 → 1) melts the scoop through 5 captioned scenes.
- **`BuilderScene.tsx`** drops each new scoop with a springy squash-and-stretch.

three.js is split into its own bundle chunk and only loads on pages that need it.

---

## 11. Build and deploy

```bash
npm run build      # output in dist/
npm run preview    # check the build locally
```

Upload `dist/` to Vercel, Netlify or any static host, and:

1. Set `VITE_API_URL` and `VITE_USE_MOCK=false` in the host's environment variables
   (they are baked in at build time, so rebuild after changing them).
2. Add a single-page-app rewrite so routes like `/shop` don't 404 on refresh.
   On Vercel, add `vercel.json`:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
   ```
   On Netlify, add `public/_redirects` containing `/*  /index.html  200`.

---

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| `Failed to resolve import "@/components/…"` | The file is in a different folder or the name is wrong. For example, `HeroStory` lives in `@/three/HeroStory`. |
| Works on Windows but breaks on Linux/Vercel | File-name casing must match imports exactly (`Overlay.tsx`, not `OverLay.tsx`). |
| Old prices or old name still showing | Restart `npm run dev`, then hard-refresh with **Ctrl + Shift + R**. In mock mode, also try **Admin → Settings → Reset demo data**. |
| "Cannot reach the server. Is the API running?" | `VITE_USE_MOCK=false` but the backend isn't running at `VITE_API_URL`. Start it or set `VITE_USE_MOCK=true`. |
| `.env` change has no effect | Vite reads `.env` only at startup. Stop and restart `npm run dev`. |
| Admin keeps getting logged out | The backend returned `401` (expired or invalid token). Sign in again. |
| Melt transitions start in the wrong place | They re-measure automatically when the page height changes. If you add content that loads late, call `ScrollTrigger.refresh()` after it loads. |
| 3D models don't appear | The browser needs WebGL. Enable hardware acceleration or try another browser. |
| Scrolling feels heavy on an older laptop | Turn on hardware acceleration in the browser. Visitors can also turn on "reduce motion" in their OS settings, which shows the transitions without animation. |
