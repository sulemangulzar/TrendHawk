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

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 15+ App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # Dashboard pages
├── components/            # Reusable components
├── docs/                 # Project documentation & guides (NEW)
│   ├── database/        # Database schema & SQL
├── lib/                  # Library configurations
└── utils/                # Utility functions
```

## Features

- ✅ Next.js 15+ & React 19 Performance
- ✅ Full Supabase Integration
- ✅ AI-Powered Candidate Insights
- ✅ Case Scenario Simulator
- ✅ Responsive Premium UI

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase
