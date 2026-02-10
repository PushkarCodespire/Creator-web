// ===========================================
// APP.TSX - Main Application Component
// Code splitting enabled for optimal performance
// ===========================================

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import PageLoader from './components/common/PageLoader';

// Layouts (not lazy loaded - needed immediately)
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Lazy load all pages for code splitting
// Public Pages
const Landing = lazy(() => import('./pages/Landing'));
const CreatorGallery = lazy(() => import('./pages/CreatorGallery'));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'));
const Chat = lazy(() => import('./pages/Chat'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Feed = lazy(() => import('./pages/Feed'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

// Sprint 5 pages
const Trending = lazy(() => import('./pages/Trending'));
const Search = lazy(() => import('./pages/Search'));
const MVP1Presentation = lazy(() => import('./pages/MVP1Presentation'));
const Community = lazy(() => import('./pages/Community'));

// Onboarding
const CreatorOnboardingWizard = lazy(() => import('./components/Onboarding/CreatorOnboardingWizard'));

// User Dashboard
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const UserChats = lazy(() => import('./pages/user/UserChats'));
const UserSubscription = lazy(() => import('./pages/user/UserSubscription'));
const UserBookmarks = lazy(() => import('./pages/user/UserBookmarks'));
const UserFollowing = lazy(() => import('./pages/user/UserFollowing'));
const UserSettings = lazy(() => import('./pages/user/UserSettings'));

// Creator Dashboard
const CreatorDashboardHome = lazy(() => import('./pages/creator/CreatorDashboardHome'));
const CreatorContent = lazy(() => import('./pages/creator/CreatorContent'));
const ContentDetails = lazy(() => import('./pages/creator/ContentDetails'));
const CreatorAnalytics = lazy(() => import('./pages/creator/CreatorAnalytics'));
const CreatorOpportunities = lazy(() => import('./pages/creator/CreatorOpportunities'));
const CreatorSettings = lazy(() => import('./pages/creator/CreatorSettings'));
const CreatorPayouts = lazy(() => import('./pages/creator/CreatorPayouts'));
const CreatorPosts = lazy(() => import('./pages/creator/CreatorPosts'));

// Company Dashboard
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const CompanyOpportunities = lazy(() => import('./pages/company/CompanyOpportunities'));
const OpportunityDetails = lazy(() => import('./pages/company/OpportunityDetails'));
const CompanyDiscover = lazy(() => import('./pages/company/CompanyDiscover'));
const CompanyDeals = lazy(() => import('./pages/company/CompanyDeals'));

// ... (other imports remain unchanged, I'm just targeting the Company Dashboard block mostly, but replace tool needs context)

// Let's target the lazy load block first


// Admin Dashboard
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCreators = lazy(() => import('./pages/admin/AdminCreators'));
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies'));
const AdminDeals = lazy(() => import('./pages/admin/AdminDeals'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminModeration = lazy(() => import('./pages/admin/AdminModeration'));
const AdminAIModeration = lazy(() => import('./pages/admin/AdminAIModeration'));
const AdminEmailPreview = lazy(() => import('./pages/admin/AdminEmailPreview'));

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/creators" element={<CreatorGallery />} />
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/posts/:id" element={<Feed />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Sprint 5 pages */}
          <Route path="/trending" element={<Trending />} />
          <Route path="/search" element={<Search />} />
          <Route path="/community" element={<Community />} />

          {/* MVP1 Presentation */}
          <Route path="/mvp1-presentation" element={<MVP1Presentation />} />
        </Route>

        {/* Onboarding Routes */}
        <Route path="/onboarding/creator" element={
          <ProtectedRoute allowedRoles={['USER', 'CREATOR']}>
            <CreatorOnboardingWizard />
          </ProtectedRoute>
        } />

        {/* Chat - Full screen without main layout */}
        <Route path="/chat/:creatorId" element={<Chat />} />

        {/* Payment Pages - Full screen (Protected) */}
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/payment-failure" element={
          <ProtectedRoute>
            <PaymentFailure />
          </ProtectedRoute>
        } />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <DashboardLayout type="user" />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="chats" element={<UserChats />} />
          <Route path="bookmarks" element={<UserBookmarks />} />
          <Route path="following" element={<UserFollowing />} />
          <Route path="subscription" element={<UserSubscription />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* Creator Dashboard */}
        <Route
          path="/creator-dashboard"
          element={
            <ProtectedRoute allowedRoles={['CREATOR', 'ADMIN']}>
              <DashboardLayout type="creator" />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreatorDashboardHome />} />
          <Route path="content" element={<CreatorContent />} />
          <Route path="content/:contentId" element={<ContentDetails />} />
          <Route path="analytics" element={<CreatorAnalytics />} />
          <Route path="posts" element={<CreatorPosts />} />
          <Route path="opportunities" element={<CreatorOpportunities />} />
          <Route path="payouts" element={<CreatorPayouts />} />
          <Route path="settings" element={<CreatorSettings />} />
        </Route>

        {/* Company Dashboard */}
        <Route
          path="/company-dashboard"
          element={
            <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
              <DashboardLayout type="company" />
            </ProtectedRoute>
          }
        >
          <Route index element={<CompanyDashboard />} />
          <Route path="opportunities" element={<CompanyOpportunities />} />
          <Route path="opportunities/:id" element={<OpportunityDetails />} />
          <Route path="deals" element={<CompanyDeals />} />
          <Route path="discover" element={<CompanyDiscover />} />
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout type="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="creators" element={<AdminCreators />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="ai-moderation" element={<AdminAIModeration />} />
          <Route path="email-preview" element={<AdminEmailPreview />} />
        </Route>

        {/* Error Pages */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
