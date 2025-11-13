# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  React UI    │  │   Service    │  │  IndexedDB   │          │
│  │  Components  │  │   Worker     │  │   (Dexie)    │          │
│  │              │  │              │  │              │          │
│  │ • Tasks      │  │ • Caching    │  │ • Tasks      │          │
│  │ • Notes      │  │ • Offline    │  │ • Notes      │          │
│  │ • Expenses   │  │ • Background │  │ • Expenses   │          │
│  │ • Habits     │  │   Sync       │  │ • Habits     │          │
│  │ • Weather    │  │ • PWA        │  │ • Logs       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Sync Manager   │
                    │  (Offline Logic) │
                    └────────┬─────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    NEXT.JS SERVER                                  │
├────────────────────────────┼──────────────────────────────────────┤
│                            │                                       │
│  ┌─────────────────────────▼─────────────────────────┐           │
│  │              API Routes (Backend)                  │           │
│  │                                                     │           │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │           │
│  │  │  /tasks  │  │  /notes  │  │/expenses │        │           │
│  │  │          │  │          │  │          │        │           │
│  │  │ GET      │  │ GET      │  │ GET      │        │           │
│  │  │ POST     │  │ POST     │  │ POST     │  ...   │           │
│  │  │ PUT      │  │ PUT      │  │ PUT      │        │           │
│  │  │ DELETE   │  │ DELETE   │  │ DELETE   │        │           │
│  │  └──────────┘  └──────────┘  └──────────┘        │           │
│  │                                                     │           │
│  │  ┌──────────────────┐  ┌────────────────┐        │           │
│  │  │   /auth          │  │   /weather     │        │           │
│  │  │  (NextAuth.js)   │  │  (Proxy API)   │        │           │
│  │  └──────────────────┘  └────────────────┘        │           │
│  └─────────────────────────────────────────────────┘           │
│                            │                                      │
│         ┌──────────────────┴──────────────────┐                 │
│         │                                       │                 │
│  ┌──────▼──────┐                    ┌──────────▼──────────┐     │
│  │  Prisma ORM │                    │   External APIs     │     │
│  │             │                    │                     │     │
│  │ • Models    │                    │ • Google OAuth      │     │
│  │ • Queries   │                    │ • OpenWeatherMap    │     │
│  │ • Types     │                    └─────────────────────┘     │
│  └──────┬──────┘                                                 │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          │
┌─────────▼──────────────────────────────────────────────────┐
│                     MONGODB ATLAS                           │
│                     (Cloud Database)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Collections:                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  users   │  │  tasks   │  │  notes   │  │ expenses │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  habits  │  │habitLogs │  │ sessions │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Online Mode (Normal Operation)

```
User Action → React Component → API Call → Next.js API Route
                                              ↓
                                        Prisma Query
                                              ↓
                                        MongoDB Atlas
                                              ↓
                                         Response
                                              ↓
                                    Update IndexedDB
                                              ↓
                                        Update UI
```

### 2. Offline Mode

```
User Action → React Component → Sync Manager
                                      ↓
                                IndexedDB
                                      ↓
                            Mark as 'pending'
                                      ↓
                                Update UI
```

### 3. Coming Back Online

```
Network Restored → Sync Manager Detects
                        ↓
                Get 'pending' items from IndexedDB
                        ↓
                Send to API Routes
                        ↓
                Save to MongoDB
                        ↓
                Update IndexedDB (mark as 'synced')
                        ↓
                Show success notification
```

## Component Architecture

```
App Layout
├── Providers
│   ├── SessionProvider (NextAuth)
│   └── OnlineStatusProvider
│       ├── Network Detection
│       ├── Sync Trigger
│       └── Status UI
│
├── Navbar
│   ├── Navigation Links
│   ├── User Profile
│   └── Sign Out
│
└── Page Content
    ├── Dashboard
    │   ├── Stats Cards
    │   ├── Recent Items
    │   └── Quick Actions
    │
    ├── Tasks (To Build)
    │   ├── Task List
    │   ├── Task Form
    │   └── Filters
    │
    ├── Notes (To Build)
    │   ├── Note Grid
    │   ├── Note Editor
    │   └── Categories
    │
    ├── Expenses (To Build)
    │   ├── Transaction List
    │   ├── Charts
    │   └── Summary
    │
    ├── Habits (To Build)
    │   ├── Habit List
    │   ├── Calendar View
    │   └── Streak Tracker
    │
    └── Weather (To Build)
        ├── Current Weather
        ├── Forecast
        └── Location Search
```

## State Management

```
┌─────────────────────────────────────────┐
│         State Management Layers          │
├─────────────────────────────────────────┤
│                                          │
│  1. Server State (NextAuth Session)     │
│     • User authentication                │
│     • Session management                 │
│                                          │
│  2. Local State (React useState)         │
│     • Form inputs                        │
│     • UI toggles                         │
│     • Temporary data                     │
│                                          │
│  3. Persistent State (IndexedDB)         │
│     • Tasks                              │
│     • Notes                              │
│     • Expenses                           │
│     • Habits                             │
│     • Offline queue                      │
│                                          │
│  4. Remote State (MongoDB via Prisma)    │
│     • Source of truth                    │
│     • Cross-device sync                  │
│     • Backup                             │
│                                          │
└─────────────────────────────────────────┘
```

## Authentication Flow

```
1. User clicks "Sign In with Google"
         ↓
2. Redirect to Google OAuth
         ↓
3. User authorizes app
         ↓
4. Redirect back with auth code
         ↓
5. NextAuth exchanges code for tokens
         ↓
6. Create/update user in MongoDB
         ↓
7. Create session
         ↓
8. Set session cookie
         ↓
9. Redirect to dashboard
         ↓
10. Fetch user data → IndexedDB
         ↓
11. User is logged in ✅
```

## PWA Installation Flow

```
1. User visits site
         ↓
2. Service Worker registers
         ↓
3. Manifest.json loads
         ↓
4. Browser shows install prompt
         ↓
5. User clicks "Install"
         ↓
6. App icon added to home screen
         ↓
7. Opens in standalone mode
         ↓
8. Works like native app ✅
```

## Offline Sync Strategy

```
┌────────────────────────────────────┐
│         Sync Strategy              │
├────────────────────────────────────┤
│                                    │
│  1. Write-Through Cache            │
│     • Save to IndexedDB first      │
│     • Then try API call            │
│                                    │
│  2. Background Sync                │
│     • Queue failed requests        │
│     • Retry when online            │
│                                    │
│  3. Conflict Resolution            │
│     • Last write wins              │
│     • Timestamp-based              │
│                                    │
│  4. Optimistic UI                  │
│     • Update UI immediately        │
│     • Rollback on error            │
│                                    │
└────────────────────────────────────┘
```

## File Structure Map

```
src/
├── app/                        [Pages & Routing]
│   ├── page.tsx               Landing
│   ├── layout.tsx             Root layout
│   ├── globals.css            Styles
│   │
│   ├── api/                   [Backend APIs]
│   │   ├── auth/              Authentication
│   │   ├── tasks/             Task CRUD
│   │   ├── notes/             Note CRUD
│   │   ├── expenses/          Expense CRUD
│   │   ├── habits/            Habit CRUD
│   │   └── weather/           Weather proxy
│   │
│   ├── auth/signin/           Auth page
│   └── dashboard/             Main dashboard
│
├── components/                [Reusable UI]
│   ├── Navbar.tsx            Navigation
│   ├── Providers.tsx         Context providers
│   └── OnlineStatusProvider   Offline detection
│
├── lib/                       [Business Logic]
│   ├── auth.ts               NextAuth config
│   ├── prisma.ts             DB client
│   ├── utils.ts              Helpers
│   │
│   └── db/                   [Offline Layer]
│       ├── indexedDB.ts      Local database
│       └── syncManager.ts    Sync logic
│
└── types/                     [TypeScript]
    └── next-auth.d.ts        Type definitions
```

## Technology Decision Tree

```
Why Next.js over React?
├─ ✅ Built-in API routes (no separate backend)
├─ ✅ Better SEO with SSR
├─ ✅ File-based routing
├─ ✅ Easier PWA setup
└─ ✅ Production-ready out of the box

Why MongoDB over PostgreSQL?
├─ ✅ Flexible schema
├─ ✅ Free tier (Atlas)
├─ ✅ Easy Prisma integration
└─ ✅ JSON-like documents

Why IndexedDB over LocalStorage?
├─ ✅ Large storage capacity
├─ ✅ Complex queries
├─ ✅ Better performance
└─ ✅ Asynchronous

Why NextAuth over custom auth?
├─ ✅ Proven security
├─ ✅ Built for Next.js
├─ ✅ Multiple providers
└─ ✅ Session management
```

## Deployment Architecture

```
Production:
┌─────────────────────────────────────┐
│          Vercel Edge Network         │
│  (CDN + Serverless Functions)       │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼─────┐    ┌─────▼───────┐
│ Static  │    │  API Routes │
│ Assets  │    │ (Serverless)│
└─────────┘    └──────┬──────┘
                      │
           ┌──────────┴──────────┐
           │                     │
    ┌──────▼──────┐    ┌────────▼────────┐
    │  MongoDB    │    │  External APIs  │
    │   Atlas     │    │  (Google, etc.) │
    └─────────────┘    └─────────────────┘
```

---

This architecture provides:
✅ **Scalability** - Can handle thousands of users
✅ **Reliability** - Works offline, syncs automatically
✅ **Security** - OAuth, session-based auth, data isolation
✅ **Performance** - CDN, caching, optimistic UI
✅ **Maintainability** - Clean separation, TypeScript, documentation
