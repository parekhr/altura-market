# Altura Market

A Pokémon-item shop demo app built with Next.js 16 and Prisma 7. Browse a randomly generated item catalog, buy and sell items, track a persistent money balance, and catch limited-time sales.

## Features

- Browse a live item catalog (pulled from PokéAPI) with a "Randomize Items" button to regenerate it
- Buy items and manage them in a personal inventory
- Sell items individually or all at once, with confirmation modals
- Persistent money balance, stored server-side per session
- Timed sale events - a random item category gets a discount for a few minutes, with a limited number of discounted units per item
- Transaction history page, with multi-item purchases grouped into a single entry

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- [Prisma 7](https://www.prisma.io) with the Postgres driver adapter
- PostgreSQL (hosted on Prisma Postgres)
- Tailwind CSS
- Deployed on [Prisma Compute](https://www.prisma.io/docs/postgres/compute)

## Getting Started

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Set up your database connection. Create a `DATABASE_URL` pointing at a Postgres database (a [Prisma Postgres](https://www.prisma.io/postgres) instance works out of the box) and configure it in `prisma.config.ts` / your `.env` file.

3. Generate the Prisma Client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

This project is deployed on Prisma Compute, not Vercel:

```bash
npx @prisma/cli app deploy --framework nextjs --env .env --prod --yes
```

## Project Structure

- `app/actions/` - Server Actions (purchase, sell, randomize items, add money, manage sales)
- `app/` - pages: shop home, inventory, transactions
- `lib/` - Prisma client setup, shop item generation, sale word list
- `context/` - client-side React context (money, search, cart)
- `components/` - shared UI components (item grid/card, sale timer, navbar)

## Data Model

- **InventoryItem** - items a session currently owns
- **Transaction** - purchase/sale history, grouped by `orderId` for multi-item orders
- **Balance** - a session's current money
- **Sale** / **SaleItemUsage** - the active timed sale and its per-item remaining discount uses
- **ShopCatalog** - the current randomized item catalog
