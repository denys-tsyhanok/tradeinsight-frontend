# Trade Insight - Frontend

A modern web portal for trading analytics and insights, built with Next.js 14+ and a powerful tech stack.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| Components | Radix UI (headless) + custom styling |
| Charts | Recharts |
| State Management | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Icons | Lucide React |
| Date Utilities | date-fns |

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository and navigate to the project:

```bash
cd trade-insight-front-end
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and configure it:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── globals.css       # Global styles & CSS variables
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── index.ts
├── hooks/                # Custom React hooks
│   ├── use-media-query.ts
│   └── index.ts
├── lib/                  # Utility functions & API client
│   ├── utils.ts
│   └── api.ts
├── providers/            # React context providers
│   ├── query-provider.tsx
│   └── index.tsx
└── types/                # TypeScript type definitions
    └── index.ts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Styling

This project uses a CSS variables-based design system with Tailwind CSS. Colors are defined in HSL format in `globals.css` for easy theming and dark mode support.

### Key Color Variables

- `--primary`: Main brand color (teal)
- `--secondary`: Secondary UI elements
- `--muted`: Muted backgrounds and text
- `--destructive`: Error/danger states
- `--chart-1` through `--chart-5`: Chart colors

## Adding New UI Components

UI components follow the Radix UI + custom styling pattern. To add a new component:

1. Create the component file in `src/components/ui/`
2. Use Radix UI primitives for accessibility
3. Style with Tailwind CSS and `cn()` utility
4. Export from `src/components/ui/index.ts`

## API Integration

The `src/lib/api.ts` file provides a typed API client. Configure the base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Use with TanStack Query:

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const { data } = useQuery({
  queryKey: ["portfolio"],
  queryFn: () => api.get("/portfolio"),
});
```

## License

Private - All rights reserved.
