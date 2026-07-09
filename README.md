# Errand

Errand is a full-stack Next.js application that bridges the gap between everyday consumers and Ghana's vibrant open markets (like Makola, Madina, and Agbogbloshie). It connects customers who need fresh produce with verified personal shoppers who navigate the markets and deliver items directly to their door.

## Core Features

### 🛒 Customer Experience
* **Dynamic Market Selection:** Customers can choose specific local markets based on their needs (e.g., bulk items vs. fresh produce).
* **Flexible Errand Buckets:** Users can add standardized catalog items with estimated prices, or create custom open-text requests (like "Dawadawa" or specific measurements).
* **Smart Pricing Engine:** Automatically calculates base target prices, delivery fees, and dynamic variable-pricing buffers to protect against open-market price fluctuations.
* **Live Order Tracking:** Real-time polling keeps the customer updated on the status of their order and ETA once a shopper is assigned.

### 🎒 Shopper (Rider) Gateway
* **Tiered Access:** New shoppers must complete a KYC verification onboarding flow before accessing the live dispatch pool.
* **Secure Login:** Returning, verified shoppers use a specialized gateway to log in and manage their deliveries.
* **Live Dispatch Board:** Shoppers view real-time orders, including itemized lists, notes from the customer, and expected payout structures.

### 🎨 Custom Design System
* Built from the ground up using a bespoke Tailwind CSS v4 `@theme` configuration.
* Eschews generic templates in favor of a warm, human-centered brand palette (Errand Obsidian, Leaf, Clay, Ochre, and Alabaster).

## Tech Stack & Skills Administered

* **Framework:** Next.js 16 (App Router, React Server Components, Turbopack)
* **Styling:** Tailwind CSS v4 (Custom properties via `@theme` in `globals.css`)
* **Database:** MongoDB (Singleton connection pattern for stable serverless operations)
* **State Management:** React Hooks (`useState`, `useEffect`) and persistent `localStorage` identity tracking for the demo environment.
* **Architecture:** Advanced Next.js Route Groups `(customer)`, `(shopper)`, and `(admin)` to isolate specific user flows without polluting the URL structure.

## Getting Started

To run the development server locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing the Flows
1. **Customer Flow:** Navigate to `/customer/dashboard` to build a cart, add custom instructions, and submit an order.
2. **Shopper Flow:** Navigate to `/shopper/dashboard`. Register a new account, then log out. Re-enter your registered name and the secure code `123` to enter the dispatch view.

## Note on Environment Variables
You will need to configure your `.env` file with your `MONGODB_URI` and ensure your current IP address is whitelisted in your MongoDB Atlas cluster settings to avoid SSL handshake errors during local development.
