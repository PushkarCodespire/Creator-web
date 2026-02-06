# Creator Platform - Frontend

React + TypeScript + Ant Design frontend for the AI Creator Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend server running on port 5000

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment (optional):**
```bash
cp .env.example .env
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will start at `http://localhost:3000`

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── layouts/      # MainLayout, DashboardLayout
│   │   └── common/       # Reusable components
│   ├── pages/
│   │   ├── user/         # User dashboard pages
│   │   ├── creator/      # Creator dashboard pages
│   │   ├── company/      # Company dashboard pages
│   │   └── admin/        # Admin dashboard pages
│   ├── store/
│   │   └── slices/       # Redux slices
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utilities
├── public/
└── index.html
```

## 🎯 Features

### Public Pages
- **Landing** (`/`) - Hero, features, how it works
- **Creator Gallery** (`/creators`) - Browse & search creators
- **Creator Profile** (`/creator/:id`) - Detailed creator page
- **Chat** (`/chat/:creatorId`) - AI chat interface
- **Pricing** (`/pricing`) - Subscription plans
- **Login/Register** (`/login`, `/register`) - Authentication

### User Dashboard (`/dashboard`)
- Overview with stats
- Chat history
- Subscription management

### Creator Dashboard (`/creator-dashboard`)
- Analytics overview
- Content management (YouTube, manual text, FAQs)
- Brand opportunities
- Profile settings

### Company Dashboard (`/company-dashboard`)
- Deal management
- Post opportunities
- Discover creators

### Admin Panel (`/admin`)
- Platform statistics
- User management
- Creator verifications

## 🔧 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design** - UI components
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - API client
- **Socket.io Client** - Real-time features

## 🛠 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📱 Pages Overview

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing | No |
| `/creators` | Creator Gallery | No |
| `/creator/:id` | Creator Profile | No |
| `/chat/:creatorId` | AI Chat | No* |
| `/pricing` | Pricing Plans | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | User Dashboard | User |
| `/dashboard/chats` | Chat History | User |
| `/dashboard/subscription` | Subscription | User |
| `/creator-dashboard` | Creator Home | Creator |
| `/creator-dashboard/content` | Content Mgmt | Creator |
| `/creator-dashboard/analytics` | Analytics | Creator |
| `/creator-dashboard/opportunities` | Opportunities | Creator |
| `/creator-dashboard/settings` | Settings | Creator |
| `/company-dashboard` | Company Home | Company |
| `/company-dashboard/opportunities` | My Opportunities | Company |
| `/company-dashboard/discover` | Discover Creators | Company |
| `/admin` | Admin Dashboard | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/creators` | Creator Verifications | Admin |

*Chat works for guests with limited messages

## 🎨 Customization

### Theme
Modify the Ant Design theme in `src/main.tsx`:
```typescript
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  }
};
```

### API URL
For production, set in `.env`:
```
VITE_API_URL=https://api.yourplatform.com
```

## 📝 Notes

- Uses Vite proxy in development to forward `/api` requests to backend
- Redux persists auth state to localStorage
- Guest users get a UUID stored in localStorage for chat tracking
