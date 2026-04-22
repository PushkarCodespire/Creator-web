// ===========================================
// API SERVICE
// ===========================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOAD_PUBLIC_PATH = import.meta.env.VITE_UPLOAD_PUBLIC_PATH || '/api/uploads';

const normalizePath = (value: string) => (value.startsWith('/') ? value : `/${value}`);
const apiBase = /^https?:\/\//i.test(API_URL)
  ? API_URL.replace(/\/+$/, '')
  : normalizePath(API_URL).replace(/\/+$/, '');
const apiOrigin = /^https?:\/\//i.test(API_URL) ? new URL(API_URL).origin : '';
const apiPath = (() => {
  if (/^https?:\/\//i.test(API_URL)) {
    const pathname = new URL(API_URL).pathname.replace(/\/+$/, '');
    return pathname ? pathname : '/';
  }
  return normalizePath(API_URL).replace(/\/+$/, '');
})();

const api = axios.create({
  baseURL: API_URL
});

export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Ensure we don't have double slashes
  const cleanPath = normalizePath(path);
  const normalizedUploadPath = normalizePath(UPLOAD_PUBLIC_PATH).replace(/\/+$/, '');

  // Map legacy /uploads paths to the configured public uploads path
  const resolvedPath = cleanPath.startsWith('/uploads/')
    ? `${normalizedUploadPath}${cleanPath.slice('/uploads'.length)}`
    : cleanPath;

  // If the path already includes the upload public path or API path, just add origin if needed
  if (
    resolvedPath === normalizedUploadPath ||
    resolvedPath.startsWith(`${normalizedUploadPath}/`) ||
    resolvedPath === apiPath ||
    resolvedPath.startsWith(`${apiPath}/`)
  ) {
    return apiOrigin ? `${apiOrigin}${resolvedPath}` : resolvedPath;
  }

  // Otherwise, attach to the API base
  return `${apiBase}${resolvedPath}`;
};

// Build download URL for binary files (images, content assets, etc.)
// Backend pattern: GET /api/download/<folder>/<filename>
export const getDownloadUrl = (folder: string, filename?: string) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;

  // Remove any leading slashes so we don't break the pattern
  const cleanFilename = filename.replace(/^\/+/, '');
  const cleanFolder = folder.replace(/(?:^\/+)|(?:\/+$)/g, '');

  // apiBase already normalizes API_URL and ensures no trailing slash
  return `${apiBase}/download/${cleanFolder}/${cleanFilename}`;
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add guest ID for anonymous users
  const guestId = localStorage.getItem('guestId');
  if (guestId) {
    config.headers['x-guest-id'] = guestId;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize backend error format: { success: false, error: { code, message, details } }
    if (error.response?.data?.error && typeof error.response.data.error === 'object') {
      const backendError = error.response.data.error;
      if (backendError.message) {
        error.response.data.error = backendError.message;
      }
      if (!error.response.data.message && backendError.message) {
        error.response.data.message = backendError.message;
      }
      // Attach for convenience if callers use error.message
      if (backendError.message) {
        error.message = backendError.message;
      }
    }

    // Only redirect to login for 401 if user was previously authenticated
    // Don't redirect for public pages that optionally use auth (like feed)
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      // Only clear and redirect if user had a token (was logged in)
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // For unauthenticated users hitting protected endpoints, just reject the promise
      // Let the component handle showing appropriate UI
    }
    return Promise.reject(error);
  }
);

// ===========================================
// AUTH API
// ===========================================

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),

  getCurrentUser: () => api.get('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),

  becomeCreator: (data?: { about?: string; expertise?: string; topics?: string }) =>
    api.post('/auth/become-creator', data || {}),
};

// ===========================================
// USER API (Sprint 5 - Personalization)
// ===========================================

export const userApi = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),

  // Update user profile
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/users/profile', data),

  // Get user interests
  getInterests: () => api.get('/users/interests'),

  // Update user interests
  updateInterests: (interests: string[]) =>
    api.put('/users/interests', { interests }),

  // Get chat summary
  getChatSummary: () => api.get('/users/chat-summary'),

  // Get available categories
  getCategories: () => api.get('/users/categories')
};

// ===========================================
// CREATOR API
// ===========================================

export const creatorApi = {
  getAll: (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    priceFilter?: 'free' | 'premium';
    minRating?: number;
    verified?: 'true' | 'false';
    sortBy?: 'popular' | 'rating' | 'newest' | 'alphabetical';
  }) =>
    api.get('/creators', { params }),

  getById: (id: string) => api.get(`/creators/${id}`),

  getContent: (creatorId: string) => api.get(`/creators/${creatorId}/content`),

  getCategories: () => api.get('/creators/categories'),

  getDashboard: () => api.get('/creators/dashboard/me'),

  updateProfile: (data: FormData | Record<string, unknown>) => {
    // Handle FormData (e.g. avatar upload) separately
    if (data instanceof FormData) {
      return api.put('/creators/profile', data);
    }

    // Ensure websiteUrl is an empty string if it's null or undefined
    const submissionData = { ...data } as Record<string, unknown>;
    if ('websiteUrl' in submissionData && (submissionData.websiteUrl === null || submissionData.websiteUrl === undefined)) {
      submissionData.websiteUrl = '';
    }

    return api.put('/creators/profile', submissionData);
  },

  getAnalytics: () => api.get('/creators/analytics/me'),

  // Advanced analytics
  getRetentionAnalytics: () => api.get('/creators/analytics/retention'),

  getRevenueForecast: () => api.get('/creators/analytics/forecast'),

  getActivityHeatmap: () => api.get('/creators/analytics/activity-heatmap'),

  getConversionFunnel: () => api.get('/creators/analytics/conversion-funnel'),

  getComparativeAnalytics: (days?: number) =>
    api.get('/creators/analytics/comparison', { params: { days } }),

  // Added based on user request
  getApplications: (params?: { page?: number; limit?: number; status?: string; creatorId?: string }) =>
    api.get('/creators/applications', { params }),

  getFollowers: (params?: { page?: number; limit?: number }) =>
    api.get('/creators/followers', { params }),

  removeFollower: (followerId: string) =>
    api.delete(`/creators/followers/${followerId}`),

  // Creator chat inbox (read-only view of conversations with the creator's AI clone)
  getMyConversations: (params?: { page?: number; limit?: number }) =>
    api.get('/creators/conversations/me', { params }),

  getMyConversationDetails: (conversationId: string) =>
    api.get(`/creators/conversations/me/${conversationId}`),

  // Manual takeover: toggle a conversation between AI and MANUAL mode
  setConversationMode: (conversationId: string, mode: 'AI' | 'MANUAL') =>
    api.post(`/creators/conversations/me/${conversationId}/mode`, { mode }),

  // Send a manual reply as the human creator (only allowed when mode === MANUAL)
  replyAsCreator: (conversationId: string, content: string) =>
    api.post(`/creators/conversations/me/${conversationId}/reply`, { content }),

  // Manually trigger an AI reply for a queued/unanswered fan message
  // (e.g. after coming back from MANUAL mode)
  generateAiReplyForLast: (conversationId: string) =>
    api.post(`/creators/conversations/me/${conversationId}/generate-ai-reply`),

  getEngagementTrend: (days: number = 7) =>
    api.get('/creators/analytics/engagement', { params: { days } }),

  generateBio: (data: { tagline: string; displayName?: string; category?: string; tags?: string[] }) =>
    api.post('/creators/generate-bio', data),

  generateAiPersonality: (data: { displayName?: string; category?: string; tagline?: string; bio?: string; aiTone?: string; tags?: string[] }) =>
    api.post('/creators/generate-ai-personality', data),
};

// ===========================================
// REVIEW API
// ===========================================

export const reviewApi = {
  // Get reviews for a creator (public)
  getReviews: (
    creatorId: string,
    params?: { page?: number; limit?: number; sort?: 'newest' | 'oldest' | 'highest' | 'lowest' }
  ) => api.get(`/creators/${creatorId}/reviews`, { params }),

  // Create a review (auth)
  create: (creatorId: string, data: { rating: number; comment?: string }) =>
    api.post(`/creators/${creatorId}/reviews`, data),

  // Update a specific review (auth, owner only)
  update: (creatorId: string, reviewId: string, data: { rating: number; comment?: string }) =>
    api.put(`/creators/${creatorId}/reviews/${reviewId}`, data),

  // Delete a specific review (auth, owner only)
  delete: (creatorId: string, reviewId: string) =>
    api.delete(`/creators/${creatorId}/reviews/${reviewId}`)
};

// ===========================================
// CHAT API
// ===========================================

export const chatApi = {
  startConversation: (creatorId: string) =>
    api.post('/chat/start', { creatorId }),

  sendMessage: (conversationId: string, content: string, media?: Record<string, unknown>[], voiceMode?: boolean) =>
    api.post('/chat/message', { conversationId, content, media, voiceMode }),

  uploadChatMedia: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });
    return api.post('/upload/chat-media', formData);
  },

  getConversation: (conversationId: string) =>
    api.get(`/chat/conversation/${conversationId}`),

  // Enhanced with filters from API_REFERENCE.md
  getUserConversations: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    timeFilter?: 'today' | 'week' | 'month' | 'all';
    sort?: 'recent' | 'alphabetical' | 'oldest';
  }) =>
    api.get('/users/chats', { params }),

  // New endpoints from AI_CHAT_API_REFERENCE.md (Fixed to match actual backend)
  getConversationMessages: (conversationId: string, params?: {
    page?: number;
    limit?: number;
  }) =>
    api.get(`/chat/conversation/${conversationId}`, { params }),

  createConversation: (creatorId: string) =>
    api.post('/chat/conversations', { creatorId }),

  getRateLimitStatus: () =>
    api.get('/chat/rate-limit/status'),

  editMessage: (messageId: string, content: string) =>
    api.put(`/chat/message/${messageId}`, { content }),

  deleteMessage: (messageId: string) =>
    api.delete(`/chat/message/${messageId}`)
};

// ===========================================
// CONTENT API
// ===========================================

export const contentApi = {
  addYouTube: (url: string, title?: string) =>
    api.post('/content/youtube', { url, title }),

  previewYouTube: (url: string) =>
    api.post('/content/youtube/preview', { url }),

  getAiSummary: () =>
    api.get('/content/ai-summary'),

  generateAiSummary: () =>
    api.post('/content/ai-summary'),

  addManual: (title: string, text: string) =>
    api.post('/content/manual', { title, text }),

  // Add FAQ bundle with title + questions/answers
  addFAQ: (title: string, faqs: { question: string; answer: string }[]) =>
    api.post('/content/faq', { title, faqs }),

  getAll: (params?: { page?: number; limit?: number }) => api.get('/content', { params }),

  getById: (contentId: string) => api.get(`/content/${contentId}`),

  delete: (contentId: string) => api.delete(`/content/${contentId}`),

  retrain: (contentId: string) => api.post(`/content/${contentId}/retrain`),

  // Voice Clone
  uploadVoiceClone: (formData: FormData) =>
    api.post('/content/voice-clone', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getVoiceClone: () => api.get('/content/voice-clone'),
  deleteVoiceClone: () => api.delete('/content/voice-clone'),
};

// ===========================================
// USER DASHBOARD API (New - from API_REFERENCE.md)
// ===========================================

export const userDashboardApi = {
  // Get comprehensive dashboard stats
  getStats: () => api.get('/user/dashboard/stats'),

  // Get recent conversations with creator details
  getRecentConversations: (params?: { limit?: number }) =>
    api.get('/user/dashboard/conversations/recent', { params }),

  // Get AI-powered creator recommendations
  getRecommendedCreators: (params?: { limit?: number }) =>
    api.get('/user/dashboard/recommendations/creators', { params }),

  // Get activity feed
  getActivityFeed: (params?: { limit?: number; days?: number }) =>
    api.get('/user/dashboard/activity-feed', { params })
};

// ===========================================
// SUBSCRIPTION API
// ===========================================

export const subscriptionApi = {
  getCurrent: () => api.get('/subscriptions/current'),
  getPlans: () => api.get('/subscriptions/plans'),
  upgrade: () => api.post('/subscriptions/upgrade'),
  cancel: () => api.post('/subscriptions/cancel'),
  getTransactions: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/subscriptions/transactions', { params }),

  // New endpoints from API_REFERENCE.md
  getDetails: () => api.get('/user/subscription/details'),
  getFeatures: () => api.get('/user/subscription/features'),
  getUsageAnalytics: (params?: { period?: number }) =>
    api.get('/user/subscription/usage-analytics', { params })
};

// ===========================================
// PAYMENT API
// ===========================================

export const paymentApi = {
  createOrder: (data: { plan: string }) => api.post('/payment/create-order', data),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/payment/verify', data),
  getStatus: (orderId: string) => api.get(`/payment/status/${orderId}`)
};

// ===========================================
// PAYOUT API
// ===========================================

export const payoutApi = {
  addBankAccount: (data: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountType: string;
    panNumber?: string;
  }) => api.post('/payouts/bank-account', data),

  getBankAccount: () => api.get('/payouts/bank-account'),

  getEarningsBreakdown: () => api.get('/payouts/earnings/breakdown'),

  requestPayout: (amount: number) => api.post('/payouts/request', { amount }),

  getPayouts: (params?: { page?: number; limit?: number }) => api.get('/payouts', { params }),

  getLedger: (params?: { page?: number; limit?: number }) => api.get('/payouts/earnings/ledger', { params })
};

// ===========================================
// PROGRAM API
// ===========================================

export const programApi = {
  getAll: () => api.get('/programs'),
  getByCreator: (creatorId: string) => api.get(`/programs/creator/${creatorId}`),
  create: (data: { name: string; description?: string; price?: number; category?: string }) => api.post('/programs', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/programs/${id}`, data),
  delete: (id: string) => api.delete(`/programs/${id}`),
};

// ===========================================
// BOOKING API
// ===========================================

export const bookingApi = {
  getPublicSlots: (creatorId: string) => api.get(`/bookings/public/${creatorId}`),
  getSlots: () => api.get('/bookings/slots'),
  createSlot: (data: { title?: string; startTime: string; endTime: string; price?: number; type?: string }) => api.post('/bookings/slots', data),
  deleteSlot: (id: string) => api.delete(`/bookings/slots/${id}`),
  getRequests: () => api.get('/bookings/requests'),
  requestBooking: (data: { slotId: string; message?: string; type?: string }) => api.post('/bookings/request', data),
  acceptRequest: (id: string, data?: { meetingLink?: string }) => api.post(`/bookings/requests/${id}/accept`, data || {}),
  updateMeetingLink: (id: string, meetingLink: string | null) => api.patch(`/bookings/requests/${id}/meeting-link`, { meetingLink }),
  declineRequest: (id: string) => api.post(`/bookings/requests/${id}/decline`),
  getStats: () => api.get('/bookings/stats'),
};

// ===========================================
// OPPORTUNITY API
// ===========================================

export const opportunityApi = {
  getAll: (params?: {
    category?: string;
    type?: string;
    status?: string;
    search?: string;
    minBudget?: number;
    maxBudget?: number;
    page?: number;
    limit?: number;
  }) =>
    api.get('/opportunities', { params }),

  getById: (id: string) => api.get(`/opportunities/${id}`),

  create: (data: Record<string, unknown>) => api.post('/opportunities', data),

  // Partial update — only OPEN opportunities are editable. `type` and `status`
  // are silently ignored by the backend if sent.
  update: (id: string, data: Record<string, unknown>) => api.put(`/opportunities/${id}`, data),

  // Cancel an OPEN opportunity. Auto-rejects all PENDING applications and
  // notifies every applicant.
  cancel: (id: string) => api.post(`/opportunities/${id}/cancel`),

  apply: (id: string, pitch: string, proposedBudget?: number) =>
    api.post(`/opportunities/${id}/apply`, { pitch, proposedBudget }),

  acceptApplication: (applicationId: string, amount: number) =>
    api.post(`/opportunities/applications/${applicationId}/accept`, { amount }),

  rejectApplication: (applicationId: string) =>
    api.post(`/opportunities/applications/${applicationId}/reject`)
};

// ===========================================
// MILESTONE API
// Endpoints live under /api/deals/:dealId/milestones and /api/milestones/:id
// ===========================================

export const milestoneApi = {
  list: (dealId: string) => api.get(`/deals/${dealId}/milestones`),

  create: (
    dealId: string,
    data: { title: string; description?: string; dueDate?: string | null }
  ) => api.post(`/deals/${dealId}/milestones`, data),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: string | null;
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    }
  ) => api.patch(`/milestones/${id}`, data),

  complete: (id: string) => api.patch(`/milestones/${id}`, { status: 'COMPLETED' }),

  delete: (id: string) => api.delete(`/milestones/${id}`)
};

// ===========================================
// COMPANY API
// ===========================================

export const companyApi = {
  getDashboard: () => api.get('/companies/dashboard'),
  updateProfile: (data: Record<string, unknown>) => api.put('/companies/profile', data),
  discoverCreators: (params?: Record<string, unknown>) => api.get('/companies/discover-creators', { params }),
  getDeals: (params?: { page?: number; limit?: number; status?: string }) => api.get('/companies/deals', { params }),
  completeDeal: (dealId: string) => api.post(`/opportunities/deals/${dealId}/complete`)
};

// ===========================================
// ADMIN API
// ===========================================

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getRevenue: () => api.get('/admin/revenue'),
  getConfig: () => api.get('/admin/config'),

  // Users
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => api.get('/admin/users', { params }),
  getUser: (userId: string) => api.get(`/admin/users/${userId}`),
  updateUser: (userId: string, data: { email?: string; name?: string; avatar?: string; isVerified?: boolean }) =>
    api.put(`/admin/users/${userId}`, data),
  updateUserRole: (userId: string, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
  suspendUser: (userId: string, data?: { days?: number; reason?: string }) =>
    api.post(`/admin/users/${userId}/suspend`, data),
  unsuspendUser: (userId: string) => api.post(`/admin/users/${userId}/unsuspend`),
  banUser: (userId: string, data?: { reason?: string }) => api.post(`/admin/users/${userId}/ban`, data),
  unbanUser: (userId: string) => api.post(`/admin/users/${userId}/unban`),

  // Creators
  getCreators: (params?: { page?: number; limit?: number; search?: string; verified?: boolean; active?: boolean; category?: string }) =>
    api.get('/admin/creators', { params }),
  getPendingCreators: (params?: { page?: number; limit?: number }) => api.get('/admin/creators/pending', { params }),
  getCreator: (creatorId: string) => api.get(`/admin/creators/${creatorId}`),
  updateCreator: (creatorId: string, data: Record<string, unknown>) => api.put(`/admin/creators/${creatorId}`, data),
  setCreatorActive: (creatorId: string, isActive: boolean) =>
    api.put(`/admin/creators/${creatorId}/active`, { isActive }),
  verifyCreator: (creatorId: string) => api.post(`/admin/creators/${creatorId}/verify`),
  rejectCreator: (creatorId: string, data?: { reason?: string }) =>
    api.post(`/admin/creators/${creatorId}/reject`, data),

  // Companies
  getCompanies: (params?: { page?: number; limit?: number; search?: string; verified?: boolean; industry?: string }) =>
    api.get('/admin/companies', { params }),
  getCompany: (companyId: string) => api.get(`/admin/companies/${companyId}`),
  updateCompany: (companyId: string, data: Record<string, unknown>) => api.put(`/admin/companies/${companyId}`, data),
  verifyCompany: (companyId: string) => api.post(`/admin/companies/${companyId}/verify`),

  // Deals
  getDeals: (params?: { page?: number; limit?: number; status?: string }) => api.get('/admin/deals', { params }),
  getDeal: (dealId: string) => api.get(`/admin/deals/${dealId}`),
  updateDealStatus: (dealId: string, status: string) => api.patch(`/admin/deals/${dealId}/status`, { status }),

  // Creator content moderation
  getCreatorContents: (creatorId: string, params?: { page?: number; limit?: number; status?: string }) =>
    api.get(`/admin/creators/${creatorId}/contents`, { params }),
  updateContentStatus: (contentId: string, data: { status: string; errorMessage?: string }) =>
    api.patch(`/admin/contents/${contentId}`, data),
  deleteContent: (contentId: string) => api.delete(`/admin/contents/${contentId}`),

  // Moderation queue
  getReports: (params?: { status?: string; priority?: string; targetType?: string; page?: number; limit?: number }) =>
    api.get('/admin/moderation/reports', { params }),
  getReportDetails: (reportId: string) => api.get(`/admin/moderation/reports/${reportId}`),
  resolveReport: (reportId: string, data: { action: string; reviewNotes: string; suspensionDays?: number }) =>
    api.post(`/admin/moderation/reports/${reportId}/resolve`, data),
  dismissReport: (reportId: string, data: { reason: string }) =>
    api.post(`/admin/moderation/reports/${reportId}/dismiss`, data),
  getModerationStats: () => api.get('/admin/moderation/stats'),
  getModerationLogs: (params?: { action?: string; moderatorId?: string; page?: number; limit?: number }) =>
    api.get('/admin/moderation/logs', { params }),
  // User moderation history
  getUserModerationHistory: (userId: string) => api.get(`/admin/moderation/users/${userId}/history`),

  // AI Moderation
  getAIModerationStats: (timeframe?: '7d' | '30d') => api.get('/admin/ai-moderation/stats', { params: { timeframe } }),
  getAIModerationLogs: (params?: { page?: number; limit?: number }) => api.get('/admin/ai-moderation/logs', { params }),
  testAIModeration: (content: string) => api.post('/admin/ai-moderation/test', { content }),
  updateAIThresholds: (data: { category: string; blockThreshold: number; flagThreshold: number }) =>
    api.put('/admin/ai-moderation/thresholds', data),

  // Email templates
  getEmailPreview: (params: {
    type: 'welcome' | 'verification' | 'password-reset' | 'password-changed' | 'payment-receipt' | 'creator-verification';
    name?: string;
    role?: string;
    verifyUrl?: string;
    resetUrl?: string;
    amount?: number;
    transactionId?: string;
    plan?: string;
    verified?: boolean;
  }) => api.get('/admin/email-preview', { params })
};

// ===========================================
// POST API (Social Features - Sprint 2)
// ===========================================

export const postApi = {
  // Get feed
  getFeed: (params?: { page?: number; limit?: number; creatorId?: string }) =>
    api.get('/posts', { params }),

  // Get single post
  getPost: (id: string) => api.get(`/posts/${id}`),

  // Create post
  createPost: (data: { content: string; media?: Record<string, unknown>[]; type?: string; publishedAt?: string }) =>
    api.post('/posts', data),

  // Update post
  updatePost: (id: string, data: { content?: string; media?: Record<string, unknown>[]; type?: string; isPublished?: boolean }) =>
    api.put(`/posts/${id}`, data),

  // Delete post
  deletePost: (id: string) => api.delete(`/posts/${id}`),

  // Like post
  likePost: (id: string) => api.post(`/posts/${id}/like`),

  // Unlike post
  unlikePost: (id: string) => api.delete(`/posts/${id}/like`),

  // Get post likes
  getPostLikes: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/posts/${id}/likes`, { params }),

  // Creator stats overview for posts
  getStatsOverview: () => api.get('/posts/stats/overview')
};

// ===========================================
// FOLLOW API (Social Features - Sprint 2)
// ===========================================

export const followApi = {
  // Follow creator
  followCreator: (creatorId: string) => api.post(`/follow/${creatorId}`),

  // Unfollow creator
  unfollowCreator: (creatorId: string) => api.delete(`/follow/${creatorId}`),

  // Check if following
  checkFollowing: (creatorId: string) => api.get(`/follow/check/${creatorId}`),

  // Get followers list
  getFollowers: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/follow/users/${userId}/followers`, { params }),

  // Enhanced with filters from API_REFERENCE.md
  getFollowing: (userId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: 'recent' | 'alphabetical' | 'popular';
  }) =>
    api.get(`/follow/users/${userId}/following`, { params }),

  // Get follow stats
  getFollowStats: (userId: string) => api.get(`/follow/users/${userId}/stats`),

  // New from API_REFERENCE.md
  getSuggestions: (params?: { limit?: number }) =>
    api.get('/follow/suggestions', { params })
};

// ===========================================
// COMMENT API (Sprint 4)
// ===========================================

export const commentApi = {
  // Create comment
  createComment: (postId: string, data: { content: string; parentId?: string }) =>
    api.post(`/posts/${postId}/comments`, data),

  // Get comments for post
  getComments: (postId: string, params?: { page?: number; limit?: number; sort?: 'newest' | 'oldest' | 'popular' }) =>
    api.get(`/posts/${postId}/comments`, { params }),

  // Get replies for comment
  getReplies: (commentId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/comments/${commentId}/replies`, { params }),

  // Update comment
  updateComment: (commentId: string, data: { content: string }) =>
    api.put(`/comments/${commentId}`, data),

  // Delete comment
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),

  // Like comment
  likeComment: (commentId: string) => api.post(`/comments/${commentId}/like`),

  // Unlike comment
  unlikeComment: (commentId: string) => api.delete(`/comments/${commentId}/like`)
};

// ===========================================
// REACTION API (Sprint 4)
// ===========================================

export const reactionApi = {
  // Add reaction to message
  addReaction: (messageId: string, emoji: string) =>
    api.post(`/messages/${messageId}/reactions`, { emoji }),

  // Remove reaction from message
  removeReaction: (messageId: string, emoji: string) =>
    api.delete(`/messages/${messageId}/reactions`, { data: { emoji } }),

  // Get all reactions for a message
  getReactions: (messageId: string) =>
    api.get(`/messages/${messageId}/reactions`)
};

// ===========================================
// LINK PREVIEW API (Sprint 4)
// ===========================================

export const linkPreviewApi = {
  // Get link preview by URL
  getPreview: (url: string) =>
    api.get('/link-preview', { params: { url } }),

  // Generate AI description from a URL
  generateDescription: (url: string, title?: string, siteName?: string) =>
    api.post('/link-preview/generate-description', { url, title, siteName }),
};

// ===========================================
// BOOKMARK API (Sprint 4)
// ===========================================

export const bookmarkApi = {
  // Add or update bookmark
  addBookmark: (messageId: string, note?: string) =>
    api.post(`/messages/${messageId}/bookmark`, { note }),

  // Remove bookmark
  removeBookmark: (messageId: string) =>
    api.delete(`/messages/${messageId}/bookmark`),

  // Enhanced with filters from API_REFERENCE.md
  getBookmarks: (params?: {
    page?: number;
    limit?: number;
    conversationId?: string;
    creatorId?: string;
    from?: string;
    to?: string;
    search?: string;
  }) =>
    api.get('/bookmarks', { params }),

  // Get user's bookmarks (alias for consistency)
  getUserBookmarks: (params?: {
    page?: number;
    limit?: number;
    conversationId?: string;
    creatorId?: string;
    from?: string;
    to?: string;
    search?: string;
  }) =>
    api.get('/bookmarks', { params }),

  // New from API_REFERENCE.md
  getRecommendations: (params?: { limit?: number }) =>
    api.get('/bookmarks/recommendations', { params })
};

// ===========================================
// TRENDING API (Sprint 5)
// ===========================================

export const trendingApi = {
  // Get trending posts
  getTrendingPosts: (params?: { timeWindow?: number; limit?: number; category?: string }) =>
    api.get('/trending/posts', { params }),

  // Get trending creators
  getTrendingCreators: (params?: { timeWindow?: number; limit?: number; category?: string }) =>
    api.get('/trending/creators', { params }),

  // Get trending hashtags
  getTrendingHashtags: (params?: { timeWindow?: number; limit?: number }) =>
    api.get('/trending/hashtags', { params }),

  // Get category-specific trending
  getCategoryTrending: (category: string, params?: { timeWindow?: number; limit?: number }) =>
    api.get(`/trending/category/${category}`, { params }),

  // Get trending stats
  getTrendingStats: () => api.get('/trending/stats')
};

// ===========================================
// SEARCH API (Sprint 5)
// ===========================================

export const searchApi = {
  // Global search
  globalSearch: (params: {
    q: string;
    type?: 'all' | 'creator' | 'post' | 'user' | 'hashtag';
    category?: string;
    limit?: number;
    page?: number;
    verified?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => api.get('/search', { params }),

  // Autocomplete search
  autocomplete: (q: string, limit?: number) =>
    api.get('/search/autocomplete', { params: { q, limit } }),

  // Get popular searches
  getPopularSearches: (limit?: number) =>
    api.get('/search/popular', { params: { limit } }),

  // Get personalized search suggestions
  getSuggestions: () => api.get('/search/suggestions')
};

// ===========================================
// RECOMMENDATION API (Sprint 5)
// ===========================================

export const recommendationApi = {
  // Get personalized creator recommendations
  getCreatorRecommendations: (params?: { limit?: number; method?: 'hybrid' | 'content' | 'collaborative' }) =>
    api.get('/recommendations/creators', { params }),

  // Get similar creators
  getSimilarCreators: (creatorId: string, limit?: number) =>
    api.get(`/recommendations/creators/${creatorId}/similar`, { params: { limit } }),

  // Get recommended posts
  getRecommendedPosts: (params?: { limit?: number; page?: number }) =>
    api.get('/recommendations/posts', { params }),

  // Get "For You" recommendations
  getForYou: (limit?: number) =>
    api.get('/recommendations/for-you', { params: { limit } }),

  // Get category recommendations
  getCategoryRecommendations: (category: string, limit?: number) =>
    api.get(`/recommendations/category/${category}`, { params: { limit } })
};

// ===========================================
// GAMIFICATION API
// ===========================================

export const gamificationApi = {
  getUserAchievements: () => api.get('/gamification/achievements'),
  getLeaderboard: (type: 'users' | 'creators' = 'users', period: 'all' | 'week' | 'month' = 'all') =>
    api.get('/gamification/leaderboard', { params: { type, period } }),
  checkAchievements: (eventType: string, eventData?: Record<string, unknown>) =>
    api.post('/gamification/check', { eventType, eventData }),
};

// ===========================================
// ANALYTICS API
// ===========================================

export const analyticsApi = {
  getUserAnalytics: (timeRange?: string) => api.get('/analytics/user', { params: { timeRange } }),
  getCreatorAnalytics: (timeRange?: string) => api.get('/analytics/creator', { params: { timeRange } }),
  getCompetitiveAnalysis: () => api.get('/analytics/competitive'),
  getContentPerformance: (contentId?: string) => api.get('/analytics/content', { params: { contentId } }),
};

// ===========================================
// MONITORING API
// ===========================================

export const monitoringApi = {
  getPerformanceStats: (params?: { endpoint?: string; hours?: number }) =>
    api.get('/monitoring/performance', { params }),
  getBusinessMetrics: (params?: { eventType?: string; days?: number }) =>
    api.get('/monitoring/business', { params }),
};

// ===========================================
// NOTIFICATION API
// ===========================================

export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) =>
    api.get('/notifications', { params }),

  getUnreadCount: () => api.get('/notifications/unread-count'),

  getSettings: () => api.get('/notifications/settings'),

  updateSettings: (data: {
    emailEnabled?: boolean;
    emailChat?: boolean;
    emailDeals?: boolean;
    emailPayments?: boolean;
    emailModeration?: boolean;
    pushEnabled?: boolean;
    soundEnabled?: boolean;
  }) => api.put('/notifications/settings', data),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
