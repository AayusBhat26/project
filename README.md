# Productivity Hub - All-in-One PWA

A comprehensive Progressive Web Application that combines **Task Management**, **Note-Taking**, **Expense Tracking**, **Habit Tracking**, and **Weather Dashboard** into one powerful productivity tool.

## 🚀 Features

### 📋 Task Manager
- Create, edit, and delete tasks
- Priority levels (high, medium, low)
- Due dates and categories
- Mark tasks as complete
- Offline-first with automatic sync

### 📝 Notes
- Rich text notes with categories
- Color-coded organization
- Pin important notes
- Full-text search
- Works completely offline

### 💰 Expense Tracker
- Track income and expenses
- Multiple categories (food, transport, bills, etc.)
- Visual charts and analytics
- Monthly summaries
- Offline data entry

### ✅ Habit Tracker
- Daily habit monitoring
- Streak tracking
- Visual progress indicators
- Custom habit goals
- Offline tracking with sync

### 🌤️ Weather Dashboard
- Real-time weather data
- Location-based forecasts
- Multiple city support
- Requires internet connection

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (Google OAuth)
- **Database**: MongoDB Atlas with Prisma ORM
- **Offline Storage**: IndexedDB (Dexie.js)
- **PWA**: next-pwa
- **State Management**: Zustand
- **Data Fetching**: SWR

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Google Cloud Console project for OAuth

### Step 1: Clone and Install Dependencies

\`\`\`bash
cd project_management_app
npm install
\`\`\`

### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

### Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Add your production URL later
6. Copy Client ID and Client Secret

### Step 4: Set Up OpenWeatherMap API

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard

### Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

\`\`\`bash
copy .env.example .env
\`\`\`

Edit `.env` with your credentials:

\`\`\`env
# Database
DATABASE_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/productivity-hub?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Weather API
NEXT_PUBLIC_WEATHER_API_KEY="your-openweathermap-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

**Generate NEXTAUTH_SECRET**:
\`\`\`bash
openssl rand -base64 32
\`\`\`

### Step 6: Initialize Prisma

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### Step 7: Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Installation

### Desktop (Chrome/Edge/Brave)
1. Visit the app in your browser
2. Look for the install icon in the address bar
3. Click "Install"

### Mobile (iOS)
1. Open in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Mobile (Android)
1. Open in Chrome
2. Tap the menu (⋮)
3. Tap "Install app" or "Add to Home Screen"

## 🔄 Offline Functionality

The app uses a robust offline-first architecture:

1. **IndexedDB Storage**: All user data is stored locally using Dexie.js
2. **Background Sync**: When internet connection is restored, pending changes automatically sync
3. **Network Detection**: Visual indicators show online/offline status
4. **Service Worker**: Caches static assets for instant loading

### How Offline Mode Works:

- ✅ **Tasks, Notes, Expenses, Habits**: Fully functional offline
- ✅ **Data Entry**: Create/edit/delete works offline
- ✅ **Automatic Sync**: Syncs when connection is restored
- ⚠️ **Weather**: Requires internet connection

## 🗂️ Project Structure

\`\`\`
project_management_app/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icon-192x192.png       # App icons
│   └── icon-512x512.png
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   ├── tasks/
│   │   │   ├── notes/
│   │   │   ├── expenses/
│   │   │   ├── habits/
│   │   │   └── weather/
│   │   ├── auth/             # Auth pages
│   │   ├── dashboard/        # Main dashboard
│   │   ├── notes/            # Notes pages
│   │   ├── expenses/         # Expenses pages
│   │   ├── habits/           # Habits pages
│   │   ├── weather/          # Weather page
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/           # React components
│   │   ├── Navbar.tsx
│   │   ├── Providers.tsx
│   │   └── OnlineStatusProvider.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── indexedDB.ts  # IndexedDB setup
│   │   │   └── syncManager.ts # Sync logic
│   │   ├── auth.ts           # NextAuth config
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── next-auth.d.ts    # TypeScript definitions
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
\`\`\`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

**Important**: Update these after deployment:
- `NEXTAUTH_URL` to your production URL
- Add production URL to Google OAuth authorized redirect URIs

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 🔧 Development Commands

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Regenerate Prisma Client
npx prisma db push   # Push schema changes to database
\`\`\`

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Change these colors
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
      },
    },
  },
},
\`\`\`

### Add More Features

The app is modular. To add a new feature:

1. Create Prisma schema model
2. Add API routes in `src/app/api/`
3. Create IndexedDB table in `indexedDB.ts`
4. Add sync logic in `syncManager.ts`
5. Build UI components and pages

## 📊 Database Schema

The app uses MongoDB with the following models:
- **User**: User authentication and profile
- **Task**: Task management data
- **Note**: Notes and content
- **Expense**: Financial transactions
- **Habit**: Habit definitions
- **HabitLog**: Daily habit completions

## 🔐 Security Features

- ✅ Google OAuth authentication
- ✅ Session-based auth with NextAuth.js
- ✅ API route protection
- ✅ User data isolation
- ✅ Secure environment variables
- ✅ HTTPS recommended for production

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
\`\`\`bash
npx prisma generate
\`\`\`

### Database connection issues
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Verify DATABASE_URL is correct
- Ensure cluster is running

### OAuth errors
- Verify redirect URIs in Google Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure NEXTAUTH_URL matches your domain

### PWA not installing
- Must use HTTPS in production
- Check manifest.json is accessible
- Verify service worker is registered

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Prisma, and MongoDB**
