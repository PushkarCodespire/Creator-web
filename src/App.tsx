// ===========================================
// APP.TSX - Main Application Component
// Code splitting enabled for optimal performance
// ===========================================

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import PageLoader from './components/common/PageLoader';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Layouts (not lazy loaded - needed immediately)
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import CreatorDashboardLayout from './components/layouts/CreatorDashboardLayout';

// Lazy load all pages for code splitting
// Public Pages
const Landing = lazy(() => import('./pages/Landing'));
const CreatorGallery = lazy(() => import('./pages/CreatorGallery'));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'));
const Chat = lazy(() => import('./pages/Chat'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const _Pricing = lazy(() => import('./pages/Pricing'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Feed = lazy(() => import('./pages/Feed'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

// Website pages (cream/orange design — from creator-platform-website)
const WebsiteLayout = lazy(() => import('./pages/website/WebsiteLayout'));
const WebsiteHome = lazy(() => import('./pages/website/WebsiteHome'));
const WebsiteFindExpert = lazy(() => import('./pages/website/WebsiteFindExpert'));
const WebsiteCreateAI = lazy(() => import('./pages/website/WebsiteCreateAI'));
const WebsiteChat = lazy(() => import('./pages/website/WebsiteChat'));
const WebsitePricing = lazy(() => import('./pages/website/WebsitePricing'));
const WebsiteCheckout = lazy(() => import('./pages/website/WebsiteCheckout'));
const WebsiteProfile = lazy(() => import('./pages/website/WebsiteProfile'));
const WebsiteUserProfile = lazy(() => import('./pages/website/WebsiteUserProfile'));
const WebsiteAbout = lazy(() => import('./pages/website/WebsiteAbout'));
const WebsiteBecomeCreator = lazy(() => import('./pages/website/WebsiteBecomeCreator'));

// Sprint 5 pages
const Trending = lazy(() => import('./pages/Trending'));
const Search = lazy(() => import('./pages/Search'));
const MVP1Presentation = lazy(() => import('./pages/MVP1Presentation'));
const Community = lazy(() => import('./pages/Community'));

// Onboarding
const CreatorOnboardingWizard = lazy(() => import('./components/Onboarding/CreatorOnboardingWizard'));
const WebsiteOnboarding = lazy(() => import('./pages/website/WebsiteOnboarding'));

// User Dashboard
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const UserChats = lazy(() => import('./pages/user/UserChats'));
const UserSubscription = lazy(() => import('./pages/user/UserSubscription'));
const UserBookmarks = lazy(() => import('./pages/user/UserBookmarks'));
const UserFollowing = lazy(() => import('./pages/user/UserFollowing'));
const UserSettings = lazy(() => import('./pages/user/UserSettings'));

// Creator Dashboard
const CreatorDashboardHome = lazy(() => import('./pages/creator/CreatorDashboardHome'));
const CreatorBookings = lazy(() => import('./pages/creator/CreatorBookings'));
const CreatorSettings = lazy(() => import('./pages/creator/CreatorSettings'));
const CreatorPayouts = lazy(() => import('./pages/creator/CreatorPayouts'));
const CreatorRevenue = lazy(() => import('./pages/creator/CreatorRevenue'));
const CreatorProducts = lazy(() => import('./pages/creator/CreatorProducts'));
const CreatorYourAI = lazy(() => import('./pages/creator/CreatorYourAI'));
const CreatorTrainAI = lazy(() => import('./pages/creator/CreatorTrainAI'));

// Company Dashboard
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const CompanyOpportunities = lazy(() => import('./pages/company/CompanyOpportunities'));
const OpportunityDetails = lazy(() => import('./pages/company/OpportunityDetails'));
const CompanyDiscover = lazy(() => import('./pages/company/CompanyDiscover'));
const CompanyDeals = lazy(() => import('./pages/company/CompanyDeals'));

// ... (other imports remain unchanged, I'm just targeting the Company Dashboard block mostly, but replace tool needs context)

// Let's target the lazy load block first


// Admin
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'));

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
      <ScrollToTop />
      <Routes>
        {/* Website pages — own layout, cream/orange design */}
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<WebsiteHome />} />
          <Route path="/find-expert" element={<WebsiteFindExpert />} />
          <Route path="/create-your-ai" element={<WebsiteCreateAI />} />
          <Route path="/pricing" element={<WebsitePricing />} />
          <Route path="/pricing/checkout" element={<WebsiteCheckout />} />
          <Route path="/creator/:creatorId" element={<WebsiteProfile />} />
          <Route path="/user/profile" element={<WebsiteUserProfile />} />
          <Route path="/about" element={<WebsiteAbout />} />
          <Route path="/become-creator" element={<WebsiteBecomeCreator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
        <Route path="/website-chat/:creatorId" element={<WebsiteChat />} />

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/explore" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/creators" element={<CreatorGallery />} />
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/posts/:id" element={<Feed />} />

          {/* Sprint 5 pages */}
          <Route path="/trending" element={<Trending />} />
          <Route path="/search" element={<Search />} />
          <Route path="/community" element={<Community />} />

          {/* MVP1 Presentation */}
          <Route path="/mvp1-presentation" element={<MVP1Presentation />} />
        </Route>

        {/* Onboarding Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <WebsiteOnboarding />
          </ProtectedRoute>
        } />
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
              <CreatorDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreatorDashboardHome />} />
          <Route path="content" element={<CreatorBookings />} />
          <Route path="revenue" element={<CreatorRevenue />} />
          <Route path="products" element={<CreatorProducts />} />
          <Route path="payouts" element={<CreatorPayouts />} />
          <Route path="your-ai" element={<CreatorYourAI />} />
          <Route path="train-ai" element={<CreatorTrainAI />} />
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

        {/* Admin Home Page management — standalone (no legacy dashboard shell) */}
        <Route
          path="/admin/home-page"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
