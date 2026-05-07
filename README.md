# Drixx

A modern, USDT-based crypto draw platform built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. Drixx lets users buy tickets, join hourly draws across multiple tiers (Fast, Mega, Express, Premium), and win USDT prizes with transparent draws and instant payouts.

---

## Key Features

### Draws
- **Multiple tiers**: Fast, Mega, Express, and Premium draws.
- **Random ticket generation**: Local 6-digit ticket numbers (100,000–999,999).
- **Auto-recreation**: Finished draws can spin up the next round automatically.

### Crypto Wallet & Transactions
- **USDT-native** balance tracking.
- **Multi-network**: TRON (TRX), Solana (SOL), and Binance Smart Chain (BSC).
- **Deposits / withdrawals** with admin approval for withdrawals.
- **Transaction history** for prize wins, ticket purchases, deposits, and withdrawals.

### Social & Rewards
- **Referral system** — earn commissions on tickets bought by users you invite.
- **Daily tasks & bonuses** — registration bonus and completion tasks.
- **Leaderboards** — ranked by winnings and participation.

### Admin Controls
- **Draw management** — create, update, manage draw status.
- **User administration** — balances, roles, and account status.
- **Withdrawal approvals** — review and approve/reject withdrawal requests.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## Project Structure

```text
├── app/                  # Next.js App Router (pages, API routes)
│   ├── admin/            # Administrative dashboard
│   ├── api/              # Backend API endpoints
│   ├── dashboard/        # User-facing dashboard
│   ├── login/register/   # Authentication flow
│   └── layout.tsx        # Global layout and providers
├── components/           # Reusable UI components (Radix + shadcn-style)
├── hooks/                # Custom React hooks
├── lib/                  # Business logic (draws, wallet, auth, supabase)
├── public/               # Static assets
└── styles/               # Global styles and Tailwind config
```

---

## Setup

### 1. Prerequisites
- Node.js (latest LTS)
- `pnpm` or `npm`
- A [Supabase](https://supabase.com/) project

### 2. Environment variables
Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install & run
```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## License

Created for private/educational purposes. See `TERMS` and `PRIVACY` pages for usage policies.
