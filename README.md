# Production-Ready Full-Stack AI Application Architecture

A scalable, feature-based modular full-stack AI application architecture engineered with strict TypeScript, modern UI/UX design patterns, clean error boundaries, JWT authentication, and AI integrations (Gemini & Apify).

## 🚀 Tech Stack

### Frontend (`/client`)
- **Core Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons)
- **State & Data Fetching**: TanStack Query v5, Axios, React Context
- **Routing & Forms**: React Router v7, React Hook Form, Zod

### Backend (`/server`)
- **Runtime**: Node.js, Express, TypeScript
- **Auth & Database**: JWT Authentication, Supabase SDK
- **AI & Automation**: Google Gemini API (`@google/genai`), Apify API (`apify-client`)
- **Validation & Utilities**: Zod, Helmet, Cors, Custom AppError pipeline

---

## 📁 Architecture & Directory Layout

```
scrap/
├── client/
│   ├── src/
│   │   ├── app/           # App root, providers, router config
│   │   ├── components/    # Reusable UI library (Button, Modal, Toast, Input, etc.) & Layouts
│   │   ├── context/       # Auth, Theme, Modal, Toast state contexts
│   │   ├── features/      # Feature modules (Auth, AI service hooks)
│   │   ├── hooks/         # Custom hooks (useAuth, useTheme, useModal, useToast)
│   │   ├── lib/           # Axios instance, Query client, Supabase client, utils
│   │   ├── schemas/       # Zod validation schemas
│   │   └── types/         # Strict TypeScript definitions
├── server/
│   ├── src/
│   │   ├── config/        # Environment validation & SDK initializers (Gemini, Apify, Supabase)
│   │   ├── controllers/   # Request controllers
│   │   ├── middlewares/   # JWT Auth, Error Handler, Zod Validation, Async Wrapper
│   │   ├── routes/        # Express API routing
│   │   ├── services/      # Gemini AI, Apify Scraper, Auth & Supabase logic
│   │   └── utils/         # Standardized API response formatting, AppError, JWT helper
```

---

## 🛠️ Quick Start

1. Install dependencies across root workspace:
   ```bash
   npm install
   ```

2. Setup Environment Variables:
   - Copy `server/.env.example` to `server/.env` and update values.

3. Run Development Servers:
   ```bash
   npm run dev
   ```

4. Build & Linting:
   ```bash
   npm run build
   npm run lint
   ```
