import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './helpers/renderWithProviders';
import { vi } from 'vitest';

// Mock all lazy-loaded page components to avoid loading the entire dependency tree
vi.mock('../pages/Landing', () => ({ default: () => <div>Landing Page</div> }));
vi.mock('../pages/CreatorGallery', () => ({ default: () => <div>Creator Gallery</div> }));
vi.mock('../pages/CreatorProfile', () => ({ default: () => <div>Creator Profile</div> }));
vi.mock('../pages/Chat', () => ({ default: () => <div>Chat Page</div> }));
vi.mock('../pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/Register', () => ({ default: () => <div>Register Page</div> }));
vi.mock('../pages/Pricing', () => ({ default: () => <div>Pricing Page</div> }));
vi.mock('../pages/PaymentSuccess', () => ({ default: () => <div>Payment Success</div> }));
vi.mock('../pages/PaymentFailure', () => ({ default: () => <div>Payment Failure</div> }));
vi.mock('../pages/VerifyEmail', () => ({ default: () => <div>Verify Email</div> }));
vi.mock('../pages/ForgotPassword', () => ({ default: () => <div>Forgot Password</div> }));
vi.mock('../pages/ResetPassword', () => ({ default: () => <div>Reset Password</div> }));
vi.mock('../pages/Feed', () => ({ default: () => <div>Feed Page</div> }));
vi.mock('../pages/UserProfile', () => ({ default: () => <div>User Profile</div> }));
vi.mock('../pages/NotFound', () => ({ default: () => <div>Not Found</div> }));
vi.mock('../pages/ServerError', () => ({ default: () => <div>Server Error</div> }));
vi.mock('../pages/Trending', () => ({ default: () => <div>Trending Page</div> }));
vi.mock('../pages/Search', () => ({ default: () => <div>Search Page</div> }));
vi.mock('../pages/MVP1Presentation', () => ({ default: () => <div>MVP1</div> }));
vi.mock('../pages/Community', () => ({ default: () => <div>Community Page</div> }));

// Website pages
vi.mock('../pages/website/WebsiteLayout', () => {
  const { Outlet } = require('react-router-dom');
  return { default: () => <div data-testid="website-layout"><Outlet /></div> };
});
vi.mock('../pages/website/WebsiteHome', () => ({ default: () => <div>Website Home</div> }));
vi.mock('../pages/website/WebsiteFindExpert', () => ({ default: () => <div>Find Expert</div> }));
vi.mock('../pages/website/WebsiteCreateAI', () => ({ default: () => <div>Create AI</div> }));
vi.mock('../pages/website/WebsiteChat', () => ({ default: () => <div>Website Chat</div> }));
vi.mock('../pages/website/WebsitePricing', () => ({ default: () => <div>Website Pricing</div> }));
vi.mock('../pages/website/WebsiteCheckout', () => ({ default: () => <div>Website Checkout</div> }));
vi.mock('../pages/website/WebsiteProfile', () => ({ default: () => <div>Website Profile</div> }));
vi.mock('../pages/website/WebsiteUserProfile', () => ({ default: () => <div>Website User Profile</div> }));
vi.mock('../pages/website/WebsiteAbout', () => ({ default: () => <div>Website About</div> }));

// Dashboard layouts
vi.mock('../components/layouts/MainLayout', () => {
  const { Outlet } = require('react-router-dom');
  return { default: () => <div data-testid="main-layout"><Outlet /></div> };
});
vi.mock('../components/layouts/DashboardLayout', () => {
  const { Outlet } = require('react-router-dom');
  return { default: ({ type }: any) => <div data-testid="dashboard-layout"><Outlet /></div> };
});
vi.mock('../components/layouts/CreatorDashboardLayout', () => {
  const { Outlet } = require('react-router-dom');
  return { default: () => <div data-testid="creator-dashboard-layout"><Outlet /></div> };
});

// Other lazy mocks
vi.mock('../components/Onboarding/CreatorOnboardingWizard', () => ({ default: () => <div>Onboarding</div> }));
vi.mock('../pages/user/UserDashboard', () => ({ default: () => <div>User Dashboard</div> }));
vi.mock('../pages/user/UserChats', () => ({ default: () => <div>User Chats</div> }));
vi.mock('../pages/user/UserSubscription', () => ({ default: () => <div>User Subscription</div> }));
vi.mock('../pages/user/UserBookmarks', () => ({ default: () => <div>User Bookmarks</div> }));
vi.mock('../pages/user/UserFollowing', () => ({ default: () => <div>User Following</div> }));
vi.mock('../pages/user/UserSettings', () => ({ default: () => <div>User Settings</div> }));
vi.mock('../pages/creator/CreatorDashboardHome', () => ({ default: () => <div>Creator Dashboard</div> }));
vi.mock('../pages/creator/CreatorBookings', () => ({ default: () => <div>Creator Bookings</div> }));
vi.mock('../pages/creator/CreatorAnalytics', () => ({ default: () => <div>Creator Analytics</div> }));
vi.mock('../pages/creator/CreatorSettings', () => ({ default: () => <div>Creator Settings</div> }));
vi.mock('../pages/creator/CreatorPayouts', () => ({ default: () => <div>Creator Payouts</div> }));
vi.mock('../pages/creator/CreatorRevenue', () => ({ default: () => <div>Creator Revenue</div> }));
vi.mock('../pages/creator/CreatorProducts', () => ({ default: () => <div>Creator Products</div> }));
vi.mock('../pages/creator/CreatorDetailedAnalytics', () => ({ default: () => <div>Creator Detailed Analytics</div> }));
vi.mock('../pages/creator/CreatorYourAI', () => ({ default: () => <div>Creator Your AI</div> }));
vi.mock('../pages/company/CompanyDashboard', () => ({ default: () => <div>Company Dashboard</div> }));
vi.mock('../pages/company/CompanyOpportunities', () => ({ default: () => <div>Company Opportunities</div> }));
vi.mock('../pages/company/OpportunityDetails', () => ({ default: () => <div>Opportunity Details</div> }));
vi.mock('../pages/company/CompanyDiscover', () => ({ default: () => <div>Company Discover</div> }));
vi.mock('../pages/company/CompanyDeals', () => ({ default: () => <div>Company Deals</div> }));
vi.mock('../pages/admin/AdminDashboard', () => ({ default: () => <div>Admin Dashboard</div> }));
vi.mock('../pages/admin/AdminUsers', () => ({ default: () => <div>Admin Users</div> }));
vi.mock('../pages/admin/AdminCreators', () => ({ default: () => <div>Admin Creators</div> }));
vi.mock('../pages/admin/AdminCompanies', () => ({ default: () => <div>Admin Companies</div> }));
vi.mock('../pages/admin/AdminDeals', () => ({ default: () => <div>Admin Deals</div> }));
vi.mock('../pages/admin/AdminRevenue', () => ({ default: () => <div>Admin Revenue</div> }));
vi.mock('../pages/admin/AdminModeration', () => ({ default: () => <div>Admin Moderation</div> }));
vi.mock('../pages/admin/AdminAIModeration', () => ({ default: () => <div>Admin AI Moderation</div> }));
vi.mock('../pages/admin/AdminEmailPreview', () => ({ default: () => <div>Admin Email Preview</div> }));

vi.mock('../components/common/PageLoader', () => ({
  default: () => <div data-testid="page-loader">Loading...</div>,
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

import App from '../App';

describe('App', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(document.querySelector('div')).toBeTruthy();
    });
  });

  it('renders home page (WebsiteHome) at root route', async () => {
    window.history.pushState({}, '', '/');
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText('Website Home')).toBeInTheDocument();
    });
  });

  it('renders find-expert page', async () => {
    window.history.pushState({}, '', '/find-expert');
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText('Find Expert')).toBeInTheDocument();
    });
  });

  it('renders login page', async () => {
    window.history.pushState({}, '', '/login');
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('renders register page', async () => {
    window.history.pushState({}, '', '/register');
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText('Register Page')).toBeInTheDocument();
    });
  });

  it('renders about page', async () => {
    window.history.pushState({}, '', '/about');
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText('Website About')).toBeInTheDocument();
    });
  });
});
