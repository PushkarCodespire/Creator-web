# IT Ticket Analyzer UI Revamp Plan

## 🎯 Objective
Revamp the complete UI of every dashboard and page to adhere to the **CodeSpire Design System** as defined in `@cursorrulesCodeSpire 1`.

## 🛠️ Design Standards Recap
- **UI Library**: Ant Design (antd)
- **Icons**: Lucide React (Exclusively)
- **Typography**: Inter (Headers: 28-36px, Body: 14-15px)
- **Colors**: Primary Blue (#1268ff), Background (#f9fafb)
- **Depth**: CodeSpire Shadow (`boxShadow: 0 8px 16px rgba(16, 24, 40, 0.06)`)
- **Radii**: 12px for cards, 8px for small elements

## 📅 Execution Phases

### Phase 1: Foundation & Shared Components
- [x] Update `src/styles/tokens.ts`
- [x] Revamp `CustomButton.tsx`
- [x] Revamp `CustomCard.tsx`
- [x] Create `CustomInput.tsx`
- [x] Create `CustomTable.tsx`
- [x] Create `CustomModal.tsx`
- [ ] Create `CustomPagination.tsx` (In-progress)

### Phase 2: Layout Revamp
- [x] Revamp `DashboardLayout.tsx` (Sidebar, Header, Navigation)
- [ ] Revamp `MainLayout.tsx` (Public Header/Footer)
- [ ] Revamp `MobileNav.tsx`

### Phase 3: Dashboard Revamps
- **User Dashboard**
  - [ ] Overview Page
  - [ ] Chats Page
  - [ ] Bookmarks Page
  - [ ] Following Page
  - [ ] Subscription Page
- **Creator Dashboard**
  - [ ] Overview Page
  - [ ] Posts Page
  - [ ] Content Page
  - [ ] Analytics Page
  - [ ] Opportunities Page
  - [ ] Payouts Page
- **Company Dashboard**
  - [ ] Overview Page
  - [ ] Opportunities Page
  - [ ] Deals Page
  - [ ] Discover Page
- **Admin Dashboard**
  - [x] Overview Page (`AdminDashboard.tsx`)
  - [x] Users Page (`AdminUsers.tsx`)
  - [x] Creators Page (`AdminCreators.tsx`)
  - [x] Companies Page (`AdminCompanies.tsx`)
  - [x] Revenue Page (`AdminRevenue.tsx`)
  - [x] Deals Page (`AdminDeals.tsx`)

### Phase 4: Common Components (Forms/Modals)
- [ ] Search Bars across all pages
- [ ] Filters across all pages
- [ ] Pagination design across all pages

## 🚀 Status Tracker
- **Overall Progress**: 25%
- **Current Task**: Phase 3 - Dashboard Revamps (Admin Completed)
