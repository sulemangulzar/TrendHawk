# TrendHawk Frontend

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

3. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](../../DEPLOYMENT.md) for Vercel deployment instructions.

## Environment Variables

### Development (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

### Production (Vercel Dashboard)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

## Project Structure

```
frontend/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # Dashboard pages
│   ├── checkout/          # Checkout page
│   ├── layout.js          # Root layout
│   └── page.js            # Landing page
├── components/            # Reusable components
│   ├── ui/               # UI components (Button, Input)
│   ├── Sidebar.js        # Dashboard sidebar
│   ├── ProductCard.js    # Product card component
│   └── Footer.js         # Footer component
├── context/              # React contexts
│   ├── AuthContext.js    # Authentication context
│   └── ThemeContext.js   # Theme context
└── utils/                # Utility functions
    └── api.js            # API client
```

## Features

- ✅ Authentication (Login/Signup)
- ✅ Dashboard with product research
- ✅ Saved products
- ✅ Dark mode
- ✅ Responsive design
- ✅ Stripe integration (ready)

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- Framer Motion
- Lucide Icons
