import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Mock axios BEFORE importing the module under test
// ---------------------------------------------------------------------------

// We capture the interceptor callbacks so we can invoke them in tests.
let requestInterceptor: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) | undefined;
let responseSuccessInterceptor: ((res: AxiosResponse) => AxiosResponse) | undefined;
let responseErrorInterceptor: ((err: unknown) => unknown) | undefined;

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn((onFulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) => {
        requestInterceptor = onFulfilled;
      }),
    },
    response: {
      use: vi.fn(
        (
          onFulfilled: (res: AxiosResponse) => AxiosResponse,
          onRejected: (err: unknown) => unknown,
        ) => {
          responseSuccessInterceptor = onFulfilled;
          responseErrorInterceptor = onRejected;
        },
      ),
    },
  },
} as unknown as AxiosInstance;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// localStorage mock
const localStorageMock = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { storage = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const locationMock = { href: '' };
Object.defineProperty(window, 'location', { value: locationMock, writable: true });

// ---------------------------------------------------------------------------
// Import the module under test (triggers interceptor registration)
// ---------------------------------------------------------------------------

import api, {
  authApi,
  userApi,
  creatorApi,
  chatApi,
  contentApi,
  subscriptionApi,
  paymentApi,
  payoutApi,
  postApi,
  followApi,
  reviewApi,
  commentApi,
  reactionApi,
  linkPreviewApi,
  bookmarkApi,
  trendingApi,
  searchApi,
  recommendationApi,
  getImageUrl,
  getDownloadUrl,
  adminApi,
  opportunityApi,
  companyApi,
  programApi,
  bookingApi,
  milestoneApi,
  gamificationApi,
  analyticsApi,
  monitoringApi,
  notificationApi,
  userDashboardApi,
} from '../api';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('API service (api.ts)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    locationMock.href = '';
    vi.clearAllMocks();
  });

  // ----- Axios instance creation -----

  describe('axios instance', () => {
    it('creates an axios instance with baseURL', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({ baseURL: expect.any(String) }),
      );
    });

    it('registers request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
      expect(requestInterceptor).toBeDefined();
      expect(responseSuccessInterceptor).toBeDefined();
      expect(responseErrorInterceptor).toBeDefined();
    });
  });

  // ----- Request interceptor -----

  describe('request interceptor', () => {
    it('attaches Authorization header when token exists', () => {
      localStorageMock.setItem('token', 'my-jwt');

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestInterceptor!(config);

      expect(result.headers.Authorization).toBe('Bearer my-jwt');
    });

    it('does not attach Authorization header when no token', () => {
      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestInterceptor!(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('attaches x-guest-id header when guestId exists', () => {
      localStorageMock.setItem('guestId', 'guest-xyz');

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestInterceptor!(config);

      expect(result.headers['x-guest-id']).toBe('guest-xyz');
    });
  });

  // ----- Response interceptor -----

  describe('response interceptor — success', () => {
    it('passes response through unchanged', () => {
      const mockRes = { data: { ok: true } } as AxiosResponse;
      expect(responseSuccessInterceptor!(mockRes)).toBe(mockRes);
    });
  });

  describe('response interceptor — error handling', () => {
    it('normalizes backend object error format to string', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: { code: 'VALIDATION', message: 'Name is required' },
          },
        },
        message: 'Request failed',
      };

      await expect(responseErrorInterceptor!(error)).rejects.toBeDefined();

      // The interceptor mutates the error in place
      expect(error.response.data.error).toBe('Name is required');
      expect(error.response.data.message).toBe('Name is required');
      expect(error.message).toBe('Name is required');
    });

    it('redirects to /login on 401 when user had a token', async () => {
      localStorageMock.setItem('token', 'expired-jwt');

      const error = {
        response: { status: 401, data: {} },
        message: 'Unauthorized',
      };

      await expect(responseErrorInterceptor!(error)).rejects.toBeDefined();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(locationMock.href).toBe('/login');
    });

    it('does NOT redirect on 401 when no token exists (public route)', async () => {
      const error = {
        response: { status: 401, data: {} },
        message: 'Unauthorized',
      };

      await expect(responseErrorInterceptor!(error)).rejects.toBeDefined();

      expect(locationMock.href).not.toBe('/login');
    });

    it('rejects the promise on non-401 errors', async () => {
      const error = {
        response: { status: 500, data: { error: 'Server error' } },
        message: 'Internal Server Error',
      };

      await expect(responseErrorInterceptor!(error)).rejects.toBeDefined();
    });
  });

  // ----- getImageUrl -----

  describe('getImageUrl', () => {
    it('returns empty string for falsy input', () => {
      expect(getImageUrl()).toBe('');
      expect(getImageUrl('')).toBe('');
      expect(getImageUrl(undefined)).toBe('');
    });

    it('returns the path unchanged if it starts with http', () => {
      expect(getImageUrl('https://cdn.example.com/img.png')).toBe(
        'https://cdn.example.com/img.png',
      );
    });

    it('prepends api base for relative paths', () => {
      const result = getImageUrl('/some/image.png');
      expect(result).toContain('/some/image.png');
    });
  });

  // ----- getDownloadUrl -----

  describe('getDownloadUrl', () => {
    it('returns empty string when filename is missing', () => {
      expect(getDownloadUrl('avatars')).toBe('');
      expect(getDownloadUrl('avatars', '')).toBe('');
    });

    it('returns filename directly if it starts with http', () => {
      expect(getDownloadUrl('avatars', 'https://cdn.example.com/a.png')).toBe(
        'https://cdn.example.com/a.png',
      );
    });

    it('builds /download/<folder>/<filename> path', () => {
      const result = getDownloadUrl('avatars', 'pic.png');
      expect(result).toContain('/download/avatars/pic.png');
    });
  });

  // ----- API object method delegation -----
  // Verify that each API namespace calls the right HTTP method + path.

  describe('authApi', () => {
    it('login calls POST /auth/login', () => {
      authApi.login('a@b.com', 'pass');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'a@b.com',
        password: 'pass',
      });
    });

    it('register calls POST /auth/register', () => {
      const data = { email: 'a@b.com', password: 'pw', name: 'A' };
      authApi.register(data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', data);
    });

    it('getCurrentUser calls GET /auth/me', () => {
      authApi.getCurrentUser();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
    });

    it('updateProfile calls PUT /auth/profile', () => {
      authApi.updateProfile({ name: 'New' });
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/profile', { name: 'New' });
    });

    it('changePassword calls PUT /auth/password', () => {
      authApi.changePassword('old', 'new');
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/password', {
        currentPassword: 'old',
        newPassword: 'new',
      });
    });

    it('becomeCreator calls POST /auth/become-creator', () => {
      authApi.becomeCreator();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/become-creator', {});
    });
  });

  describe('chatApi', () => {
    it('startConversation calls POST /chat/start', () => {
      chatApi.startConversation('c-1');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/chat/start', { creatorId: 'c-1' });
    });

    it('sendMessage calls POST /chat/message', () => {
      chatApi.sendMessage('conv-1', 'hello', undefined, false);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/chat/message', {
        conversationId: 'conv-1',
        content: 'hello',
        media: undefined,
        voiceMode: false,
      });
    });

    it('getConversation calls GET /chat/conversation/:id', () => {
      chatApi.getConversation('conv-1');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chat/conversation/conv-1');
    });

    it('getUserConversations calls GET /users/chats', () => {
      chatApi.getUserConversations();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/chats', { params: undefined });
    });

    it('editMessage calls PUT /chat/message/:id', () => {
      chatApi.editMessage('msg-1', 'edited');
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/chat/message/msg-1', { content: 'edited' });
    });

    it('deleteMessage calls DELETE /chat/message/:id', () => {
      chatApi.deleteMessage('msg-1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/chat/message/msg-1');
    });
  });

  describe('creatorApi', () => {
    it('getAll calls GET /creators with params', () => {
      creatorApi.getAll({ category: 'tech', page: 1 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/creators', {
        params: { category: 'tech', page: 1 },
      });
    });

    it('getById calls GET /creators/:id', () => {
      creatorApi.getById('c-1');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/creators/c-1');
    });

    it('getDashboard calls GET /creators/dashboard/me', () => {
      creatorApi.getDashboard();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/creators/dashboard/me');
    });
  });

  describe('userApi', () => {
    it('getProfile calls GET /users/profile', () => {
      userApi.getProfile();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/profile');
    });

    it('updateInterests calls PUT /users/interests', () => {
      userApi.updateInterests(['music', 'art']);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/interests', {
        interests: ['music', 'art'],
      });
    });
  });

  describe('contentApi', () => {
    it('addYouTube calls POST /content/youtube', () => {
      contentApi.addYouTube('https://yt.com/vid', 'My Video');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/content/youtube', {
        url: 'https://yt.com/vid',
        title: 'My Video',
      });
    });

    it('delete calls DELETE /content/:id', () => {
      contentApi.delete('ct-1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/content/ct-1');
    });
  });

  describe('subscriptionApi', () => {
    it('getCurrent calls GET /subscriptions/current', () => {
      subscriptionApi.getCurrent();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/subscriptions/current');
    });

    it('upgrade calls POST /subscriptions/upgrade', () => {
      subscriptionApi.upgrade();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/subscriptions/upgrade');
    });
  });

  describe('paymentApi', () => {
    it('createOrder calls POST /payment/create-order', () => {
      paymentApi.createOrder({ plan: 'PREMIUM' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payment/create-order', { plan: 'PREMIUM' });
    });
  });

  describe('payoutApi', () => {
    it('requestPayout calls POST /payouts/request', () => {
      payoutApi.requestPayout(500);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payouts/request', { amount: 500 });
    });
  });

  describe('postApi', () => {
    it('getFeed calls GET /posts', () => {
      postApi.getFeed({ page: 1, limit: 10 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts', {
        params: { page: 1, limit: 10 },
      });
    });

    it('likePost calls POST /posts/:id/like', () => {
      postApi.likePost('p-1');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/posts/p-1/like');
    });

    it('deletePost calls DELETE /posts/:id', () => {
      postApi.deletePost('p-1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/posts/p-1');
    });
  });

  describe('followApi', () => {
    it('followCreator calls POST /follow/:id', () => {
      followApi.followCreator('c-1');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/follow/c-1');
    });

    it('unfollowCreator calls DELETE /follow/:id', () => {
      followApi.unfollowCreator('c-1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/follow/c-1');
    });
  });

  describe('reviewApi', () => {
    it('create calls POST /creators/:id/reviews', () => {
      reviewApi.create('c-1', { rating: 5, review: 'Great!' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/creators/c-1/reviews', {
        rating: 5,
        review: 'Great!',
      });
    });
  });

  describe('commentApi', () => {
    it('createComment calls POST /posts/:id/comments', () => {
      commentApi.createComment('p-1', { content: 'nice' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/posts/p-1/comments', {
        content: 'nice',
      });
    });
  });

  describe('reactionApi', () => {
    it('addReaction calls POST /messages/:id/reactions', () => {
      reactionApi.addReaction('m-1', '👍');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/messages/m-1/reactions', {
        emoji: '👍',
      });
    });
  });

  describe('linkPreviewApi', () => {
    it('getPreview calls GET /link-preview', () => {
      linkPreviewApi.getPreview('https://example.com');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/link-preview', {
        params: { url: 'https://example.com' },
      });
    });
  });

  describe('bookmarkApi', () => {
    it('addBookmark calls POST /messages/:id/bookmark', () => {
      bookmarkApi.addBookmark('m-1', 'my note');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/messages/m-1/bookmark', {
        note: 'my note',
      });
    });
  });

  describe('trendingApi', () => {
    it('getTrendingPosts calls GET /trending/posts', () => {
      trendingApi.getTrendingPosts({ limit: 5 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trending/posts', {
        params: { limit: 5 },
      });
    });
  });

  describe('searchApi', () => {
    it('globalSearch calls GET /search', () => {
      searchApi.globalSearch({ q: 'react' });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search', {
        params: { q: 'react' },
      });
    });
  });

  describe('recommendationApi', () => {
    it('getForYou calls GET /recommendations/for-you', () => {
      recommendationApi.getForYou(10);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/recommendations/for-you', {
        params: { limit: 10 },
      });
    });
  });

  describe('opportunityApi', () => {
    it('apply calls POST /opportunities/:id/apply', () => {
      opportunityApi.apply('opp-1', 'My pitch', 1000);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/opportunities/opp-1/apply', {
        pitch: 'My pitch',
        proposedBudget: 1000,
      });
    });
  });

  describe('companyApi', () => {
    it('getDashboard calls GET /companies/dashboard', () => {
      companyApi.getDashboard();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/companies/dashboard');
    });
  });

  describe('adminApi', () => {
    it('getStats calls GET /admin/stats', () => {
      adminApi.getStats();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/stats');
    });

    it('suspendUser calls POST /admin/users/:id/suspend', () => {
      adminApi.suspendUser('u-1', { days: 7, reason: 'Spam' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/admin/users/u-1/suspend', {
        days: 7,
        reason: 'Spam',
      });
    });

    it('verifyCreator calls POST /admin/creators/:id/verify', () => {
      adminApi.verifyCreator('cr-1');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/admin/creators/cr-1/verify');
    });
  });

  describe('milestoneApi', () => {
    it('list calls GET /deals/:dealId/milestones', () => {
      milestoneApi.list('d-1');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/deals/d-1/milestones');
    });

    it('complete calls PATCH /milestones/:id with COMPLETED status', () => {
      milestoneApi.complete('m-1');
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/milestones/m-1', {
        status: 'COMPLETED',
      });
    });
  });

  describe('gamificationApi', () => {
    it('getUserAchievements calls GET /gamification/achievements', () => {
      gamificationApi.getUserAchievements();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/gamification/achievements');
    });
  });

  describe('notificationApi', () => {
    it('markAsRead calls PUT /notifications/:id/read', () => {
      notificationApi.markAsRead('n-1');
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/notifications/n-1/read');
    });

    it('markAllAsRead calls PUT /notifications/read-all', () => {
      notificationApi.markAllAsRead();
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/notifications/read-all');
    });
  });

  describe('userDashboardApi', () => {
    it('getStats calls GET /user/dashboard/stats', () => {
      userDashboardApi.getStats();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/dashboard/stats');
    });
  });

  describe('programApi', () => {
    it('create calls POST /programs', () => {
      programApi.create({ name: 'Course' });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/programs', { name: 'Course' });
    });
  });

  describe('bookingApi', () => {
    it('getPublicSlots calls GET /bookings/public/:creatorId', () => {
      bookingApi.getPublicSlots('c-1');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/public/c-1');
    });
  });

  describe('analyticsApi', () => {
    it('getUserAnalytics calls GET /analytics/user', () => {
      analyticsApi.getUserAnalytics('7d');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/user', {
        params: { timeRange: '7d' },
      });
    });
  });

  describe('monitoringApi', () => {
    it('getPerformanceStats calls GET /monitoring/performance', () => {
      monitoringApi.getPerformanceStats({ hours: 24 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/monitoring/performance', {
        params: { hours: 24 },
      });
    });
  });

  // ----- Default export -----

  describe('default export', () => {
    it('exports the axios instance', () => {
      expect(api).toBe(mockAxiosInstance);
    });
  });
});
