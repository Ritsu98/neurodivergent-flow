# Neurodivergent Flow

A neurodivergent-friendly weekly planner app designed to help ADHD/autistic adults build sustainable weekly rhythms with minimal setup, energy-aware adjustments, and compassionate scaffolding.

## 🎯 Vision

Help neurodivergent users maintain a sustainable weekly rhythm: 2 Focus days, 2 Recharge days, 2 Flex days, + 1 Admin day, with low setup, energy-aware adjustments, and minimal friction.

## ✨ Core Features

- **Hybrid Scheduling**: Each day has exactly ONE Primary Block (Focus/Recharge/Flex/Admin)
- **Work Window Overlay**: Optional work time that shifts Primary Block to evenings (doesn't compete as block type)
- **Energy-Aware Adaptation**: Green/Yellow/Red energy modes automatically adjust plan complexity
- **Local-First**: Works completely offline, syncs when online
- **4 Runners**: Focus Runner, Recharge Runner, Flex Sprint, Admin Sprint
- **Sunday Setup**: 10-minute guided weekly planning
- **Supplements Module**: Opt-in reminders with safety disclaimers

## 🏗️ Architecture

### Tech Stack

- **Monorepo**: pnpm + Turborepo
- **Mobile**: React Native (Expo) + NativeWind
- **Web**: Next.js 14 (PWA-ready) + Tailwind CSS
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage, Edge Functions)
- **Local Storage**: SQLite (mobile), IndexedDB (web)
- **State Management**: Zustand (UI), TanStack Query (server sync)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS (shared config as source of truth)

### Project Structure

```
neurodivergent-flow/
├── apps/
│   ├── mobile/          # React Native (Expo) + NativeWind
│   └── web/            # Next.js (PWA) + Tailwind CSS
├── packages/
│   ├── core/           # Shared types, schemas, business logic
│   ├── api/            # Supabase client, queries, mutations
│   └── ui/             # Shared UI components (minimal for MVP)
├── tailwind.config.ts  # Shared design tokens (source of truth)
└── turbo.json          # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase account (free tier works)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd neurodivergent-flow
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create `.env.local` files in `apps/web` and `apps/mobile`:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# apps/mobile/.env.local (or use Expo config)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

- Create a new Supabase project
- Run the database migrations (see `docs/supabase-schema.sql` - to be added)
- Configure Row Level Security (RLS) policies

5. **Start development servers**

```bash
# Start all apps
pnpm dev

# Or start individually
pnpm --filter @neurodivergent-flow/web dev
pnpm --filter @neurodivergent-flow/mobile dev
```

## 📦 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean all build artifacts

### Package-Specific

- `pnpm --filter <package-name> <script>` - Run script in specific package

## 🗂️ Package Details

### `@neurodivergent-flow/core`

Shared TypeScript types, Zod schemas, and business logic.

**Exports:**
- Types: `UserPrefs`, `WeekPlan`, `Task`, `EnergyLog`, `InboxItem`, `Supplement`, etc.
- Schemas: Zod validation schemas for all types
- Logic: Week plan generation, energy adaptation, etc. (to be added)

### `@neurodivergent-flow/api`

Supabase client and data access layer.

**Exports:**
- `supabase` - Supabase client instance
- Query hooks (TanStack Query) - to be added
- Mutation hooks - to be added

### `@neurodivergent-flow/ui`

Shared UI components (minimal for MVP).

**Note:** For MVP, we use platform-specific components (NativeWind for mobile, Tailwind for web) rather than cross-platform components.

### `@neurodivergent-flow/web`

Next.js web application.

- PWA-ready
- Tailwind CSS styling
- Server-side rendering support

### `@neurodivergent-flow/mobile`

React Native mobile application (Expo).

- NativeWind for styling
- SQLite for local storage
- Expo Notifications for push notifications

## 🎨 Design System

Design tokens are defined in the shared `tailwind.config.ts` file. Both web (Tailwind CSS) and mobile (NativeWind) consume the same configuration.

**Key Colors:**
- Primary: Blue scale (50-900)
- Energy: Green (4-5), Yellow (2-3), Red (0-1)
- Surface: White/Dark gray
- Text: Primary, Secondary, Muted

**Spacing:** xs (4px), sm (8px), md (16px), lg (24px), xl (32px)

**Typography:** xs, sm, base, lg, xl, 2xl, 3xl

## 🗄️ Database Schema

See `PRODUCT_SPEC.md` for complete database schema. Key tables:

- `user_prefs` - User preferences and settings
- `week_plans` - Weekly plans with day themes
- `tasks` - Tasks (Top 3, This Week, Done)
- `energy_logs` - Energy level logs (AM/PM/Eve)
- `inbox_items` - "Later" capture items
- `supplements` - Supplement templates
- `user_supplement_plans` - User's supplement plans
- `supplement_logs` - Supplement tracking logs

## 🔄 Development Workflow

### Adding a New Feature

1. Create types in `packages/core/src/types/`
2. Create Zod schemas in `packages/core/src/schemas/`
3. Add business logic in `packages/core/src/logic/` (if needed)
4. Create API queries/mutations in `packages/api/src/`
5. Build UI in `apps/web` or `apps/mobile`
6. Test locally
7. Update documentation

### Code Style

- TypeScript everywhere (no `any` without explicit comment)
- Zod schemas are source of truth for validation
- Keep components small (< 150 lines)
- Use Zustand for UI state, TanStack Query for server sync
- Follow Prettier formatting (run `pnpm format`)

## 📚 Documentation

- **Product Specification**: See `PRODUCT_SPEC.md` for complete feature specs
- **Agent Rules**: See `AGENTS.md` for development guidelines and principles
- **Stage Plan**: See `PRODUCT_SPEC.md` for detailed build stages

## 🧪 Testing

Testing setup to be added in later stages.

## 🚢 Deployment

### Web

Deploy to Vercel (or chosen platform):

```bash
pnpm --filter @neurodivergent-flow/web build
```

### Mobile

Build with Expo Application Services (EAS):

```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
```

## 🤝 Contributing

This is a personal project, but contributions are welcome. Please read `AGENTS.md` for development guidelines and principles.

## 📄 License

[To be determined]

## 🙏 Acknowledgments

Built with compassion for the neurodivergent community. Designed to reduce decision fatigue and support sustainable rhythms.

---

**Status**: 🚧 In Development (Stage 1: Foundation)

For detailed build plan, see `PRODUCT_SPEC.md`.
