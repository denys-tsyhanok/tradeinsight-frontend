# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on the codebase

### Installation
- `npm install` - Install all dependencies

## Architecture Overview

This is a **Next.js 14+ application** using the App Router with a trading analytics dashboard focus. The project follows a modular, layered architecture:

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS with CSS variables for theming

### Key Architectural Patterns

#### 1. Provider Architecture
The app uses a nested provider pattern at the root layout:
- `QueryProvider` - TanStack Query for API state management
- `AuthProvider` - Authentication context and user state
- `PortfolioProvider` - Portfolio selection and management

#### 2. API Layer
Centralized API client in `src/lib/api.ts`:
- Typed DTOs for all API endpoints
- Token-based authentication with localStorage
- Organized by domain: auth, portfolios, reports, dividends, analysis
- Error handling with custom `ApiError` class
- All API calls are portfolio-scoped (portfolioId parameter)

#### 3. Routing Structure
App Router with nested layouts:
- `(auth)` - Authentication pages (login, register)
- `dashboard` - Main dashboard with nested layout
- `holdings/[analysisId]/[symbol]` - Dynamic routing for holding details
- Protected routes via authentication providers

#### 4. Component Organization
- `components/ui/` - Reusable UI primitives (button, card, input, etc.)
- `components/dashboard/` - Dashboard-specific components
- `components/layout/` - Layout components (sidebar, dashboard layout)
- All UI components use Radix UI for accessibility and custom Tailwind styling

#### 5. Dark Mode First
The app is designed with dark mode as default (`className="dark"` on html element). All colors use CSS variables defined in HSL format for consistent theming.

## Important Context

### API Configuration
The backend API URL is configured via environment variable:
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Portfolio-Centric Design
All major features (reports, analysis, dividends, holdings) are scoped to a specific portfolio. The `PortfolioProvider` manages the currently selected portfolio context.

### Authentication Flow
- JWT tokens stored in localStorage
- Token automatically included in API requests via `fetchApi` wrapper
- Auth state managed globally through `AuthProvider`

### Type Safety
- Full TypeScript with strict mode enabled
- Comprehensive DTOs for all API responses
- Path aliasing configured (`@/*` maps to `./src/*`)

## Development Workflow

When implementing new features:

1. **UI Components**: Check existing components in `src/components/ui/` before creating new ones. Follow the Radix UI + Tailwind pattern.

2. **API Integration**: Add new endpoints to `src/lib/api.ts` with proper TypeScript types. Ensure portfolio scoping where applicable.

3. **State Management**: Use TanStack Query for server state. Avoid unnecessary client state.

4. **Styling**: Use existing CSS variables and Tailwind classes. Maintain dark mode compatibility.

5. **Forms**: Implement with React Hook Form + Zod for validation. See existing patterns in auth pages.