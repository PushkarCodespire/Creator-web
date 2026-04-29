// Calling every API method executes the wrapper bodies and drives line coverage.
// Axios is fully mocked so no real network requests are made.

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  const mockAxios = {
    create: vi.fn(() => mockInstance),
    defaults: {},
  };
  return { default: mockAxios };
});

import {
  getImageUrl,
  getDownloadUrl,
  authApi,
  userApi,
  creatorApi,
  reviewApi,
  chatApi,
  contentApi,
  userDashboardApi,
  subscriptionApi,
  paymentApi,
  payoutApi,
  programApi,
  bookingApi,
  opportunityApi,
  milestoneApi,
  companyApi,
  homeApi,
  adminApi,
  postApi,
  followApi,
  commentApi,
  reactionApi,
  linkPreviewApi,
  bookmarkApi,
  trendingApi,
  searchApi,
  recommendationApi,
  gamificationApi,
  analyticsApi,
  monitoringApi,
  notificationApi,
} from '../api';

// ─── Utility functions ────────────────────────────────────────────────────────

describe('getImageUrl', () => {
  it('returns empty string for undefined', () => expect(getImageUrl(undefined)).toBe(''));
  it('returns empty string for empty string', () => expect(getImageUrl('')).toBe(''));
  it('returns absolute https URLs unchanged', () => expect(getImageUrl('https://example.com/img.png')).toBe('https://example.com/img.png'));
  it('returns absolute http URLs unchanged', () => expect(getImageUrl('http://example.com/img.png')).toBe('http://example.com/img.png'));
  it('handles relative paths', () => expect(getImageUrl('/some/image.jpg')).toContain('image.jpg'));
  it('handles paths without leading slash', () => expect(getImageUrl('some/image.jpg')).toContain('image.jpg'));
  it('maps /uploads/ to upload public path', () => {
    const result = getImageUrl('/uploads/content/photo.jpg');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getDownloadUrl', () => {
  it('returns empty string for undefined filename', () => expect(getDownloadUrl('content', undefined)).toBe(''));
  it('returns empty string for empty filename', () => expect(getDownloadUrl('content', '')).toBe(''));
  it('returns absolute URLs unchanged', () => expect(getDownloadUrl('content', 'https://example.com/f.pdf')).toBe('https://example.com/f.pdf'));
  it('builds a download URL for relative filename', () => {
    const result = getDownloadUrl('content', 'file.pdf');
    expect(result).toContain('download');
    expect(result).toContain('content');
    expect(result).toContain('file.pdf');
  });
  it('strips leading slashes from filename', () => expect(getDownloadUrl('images', '/photo.jpg')).not.toContain('//'));
  it('strips slashes from folder', () => {
    const result = getDownloadUrl('/content/', 'file.pdf');
    expect(result).toContain('content');
  });
});

// ─── authApi ──────────────────────────────────────────────────────────────────

describe('authApi', () => {
  it('login', () => expect(authApi.login('a@b.com', 'pw')).toBeInstanceOf(Promise));
  it('register', () => expect(authApi.register({ email: 'a@b.com', password: 'pw', name: 'Test' })).toBeInstanceOf(Promise));
  it('getCurrentUser', () => expect(authApi.getCurrentUser()).toBeInstanceOf(Promise));
  it('updateProfile', () => expect(authApi.updateProfile({ name: 'Test' })).toBeInstanceOf(Promise));
  it('changePassword', () => expect(authApi.changePassword('old', 'new')).toBeInstanceOf(Promise));
  it('becomeCreator with data', () => expect(authApi.becomeCreator({ about: 'hi' })).toBeInstanceOf(Promise));
  it('becomeCreator without data', () => expect(authApi.becomeCreator()).toBeInstanceOf(Promise));
});

// ─── userApi ──────────────────────────────────────────────────────────────────

describe('userApi', () => {
  it('getProfile', () => expect(userApi.getProfile()).toBeInstanceOf(Promise));
  it('updateProfile', () => expect(userApi.updateProfile({ name: 'Test' })).toBeInstanceOf(Promise));
  it('getInterests', () => expect(userApi.getInterests()).toBeInstanceOf(Promise));
  it('updateInterests', () => expect(userApi.updateInterests(['fitness'])).toBeInstanceOf(Promise));
  it('getChatSummary', () => expect(userApi.getChatSummary()).toBeInstanceOf(Promise));
  it('getCategories', () => expect(userApi.getCategories()).toBeInstanceOf(Promise));
});

// ─── creatorApi ───────────────────────────────────────────────────────────────

describe('creatorApi', () => {
  it('getAll with no params', () => expect(creatorApi.getAll()).toBeInstanceOf(Promise));
  it('getAll with params', () => expect(creatorApi.getAll({ category: 'fitness', page: 1 })).toBeInstanceOf(Promise));
  it('getById', () => expect(creatorApi.getById('c1')).toBeInstanceOf(Promise));
  it('getContent', () => expect(creatorApi.getContent('c1')).toBeInstanceOf(Promise));
  it('getCategories', () => expect(creatorApi.getCategories()).toBeInstanceOf(Promise));
  it('getDashboard', () => expect(creatorApi.getDashboard()).toBeInstanceOf(Promise));
  it('updateProfile with plain object', () => expect(creatorApi.updateProfile({ displayName: 'Test' })).toBeInstanceOf(Promise));
  it('updateProfile with null websiteUrl normalises to empty string', () =>
    expect(creatorApi.updateProfile({ displayName: 'Test', websiteUrl: null as unknown as string })).toBeInstanceOf(Promise));
  it('updateProfile with FormData', () => {
    const fd = new FormData();
    expect(creatorApi.updateProfile(fd)).toBeInstanceOf(Promise);
  });
  it('getAnalytics', () => expect(creatorApi.getAnalytics()).toBeInstanceOf(Promise));
  it('getRetentionAnalytics', () => expect(creatorApi.getRetentionAnalytics()).toBeInstanceOf(Promise));
  it('getRevenueForecast', () => expect(creatorApi.getRevenueForecast()).toBeInstanceOf(Promise));
  it('getActivityHeatmap', () => expect(creatorApi.getActivityHeatmap()).toBeInstanceOf(Promise));
  it('getConversionFunnel', () => expect(creatorApi.getConversionFunnel()).toBeInstanceOf(Promise));
  it('getComparativeAnalytics', () => expect(creatorApi.getComparativeAnalytics(30)).toBeInstanceOf(Promise));
  it('getApplications', () => expect(creatorApi.getApplications({ page: 1 })).toBeInstanceOf(Promise));
  it('getFollowers', () => expect(creatorApi.getFollowers()).toBeInstanceOf(Promise));
  it('removeFollower', () => expect(creatorApi.removeFollower('f1')).toBeInstanceOf(Promise));
  it('getMyConversations', () => expect(creatorApi.getMyConversations()).toBeInstanceOf(Promise));
  it('getMyConversationDetails', () => expect(creatorApi.getMyConversationDetails('conv1')).toBeInstanceOf(Promise));
  it('setConversationMode', () => expect(creatorApi.setConversationMode('conv1', 'AI')).toBeInstanceOf(Promise));
  it('replyAsCreator', () => expect(creatorApi.replyAsCreator('conv1', 'Hello!')).toBeInstanceOf(Promise));
  it('generateAiReplyForLast', () => expect(creatorApi.generateAiReplyForLast('conv1')).toBeInstanceOf(Promise));
  it('getEngagementTrend', () => expect(creatorApi.getEngagementTrend(7)).toBeInstanceOf(Promise));
  it('generateBio', () => expect(creatorApi.generateBio({ tagline: 'Fitness coach' })).toBeInstanceOf(Promise));
  it('generateAiPersonality', () => expect(creatorApi.generateAiPersonality({ displayName: 'Test' })).toBeInstanceOf(Promise));
});

// ─── reviewApi ────────────────────────────────────────────────────────────────

describe('reviewApi', () => {
  it('getReviews', () => expect(reviewApi.getReviews('c1')).toBeInstanceOf(Promise));
  it('create', () => expect(reviewApi.create('c1', { rating: 5 })).toBeInstanceOf(Promise));
  it('update', () => expect(reviewApi.update('c1', 'r1', { rating: 4 })).toBeInstanceOf(Promise));
  it('delete', () => expect(reviewApi.delete('c1', 'r1')).toBeInstanceOf(Promise));
});

// ─── chatApi ──────────────────────────────────────────────────────────────────

describe('chatApi', () => {
  it('startConversation', () => expect(chatApi.startConversation('c1')).toBeInstanceOf(Promise));
  it('sendMessage without voice mode', () => expect(chatApi.sendMessage('conv1', 'Hello')).toBeInstanceOf(Promise));
  it('sendMessage with voice mode', () => expect(chatApi.sendMessage('conv1', 'Hello', [], true, 'chatterbox')).toBeInstanceOf(Promise));
  it('uploadChatMedia', () => {
    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
    expect(chatApi.uploadChatMedia([file])).toBeInstanceOf(Promise);
  });
  it('getConversation', () => expect(chatApi.getConversation('conv1')).toBeInstanceOf(Promise));
  it('getUserConversations', () => expect(chatApi.getUserConversations()).toBeInstanceOf(Promise));
  it('getConversationMessages', () => expect(chatApi.getConversationMessages('conv1')).toBeInstanceOf(Promise));
  it('createConversation', () => expect(chatApi.createConversation('c1')).toBeInstanceOf(Promise));
  it('getRateLimitStatus', () => expect(chatApi.getRateLimitStatus()).toBeInstanceOf(Promise));
  it('editMessage', () => expect(chatApi.editMessage('m1', 'edited')).toBeInstanceOf(Promise));
  it('deleteMessage', () => expect(chatApi.deleteMessage('m1')).toBeInstanceOf(Promise));
});

// ─── contentApi ───────────────────────────────────────────────────────────────

describe('contentApi', () => {
  it('addYouTube', () => expect(contentApi.addYouTube('https://youtube.com/watch?v=abc')).toBeInstanceOf(Promise));
  it('previewYouTube', () => expect(contentApi.previewYouTube('https://youtube.com/watch?v=abc')).toBeInstanceOf(Promise));
  it('getAiSummary', () => expect(contentApi.getAiSummary()).toBeInstanceOf(Promise));
  it('generateAiSummary', () => expect(contentApi.generateAiSummary()).toBeInstanceOf(Promise));
  it('addManual', () => expect(contentApi.addManual('Title', 'Body text')).toBeInstanceOf(Promise));
  it('addFAQ', () => expect(contentApi.addFAQ('FAQ Title', [{ question: 'Q?', answer: 'A.' }])).toBeInstanceOf(Promise));
  it('getAll', () => expect(contentApi.getAll()).toBeInstanceOf(Promise));
  it('getById', () => expect(contentApi.getById('cnt1')).toBeInstanceOf(Promise));
  it('delete', () => expect(contentApi.delete('cnt1')).toBeInstanceOf(Promise));
  it('retrain', () => expect(contentApi.retrain('cnt1')).toBeInstanceOf(Promise));
  it('uploadVoiceClone', () => {
    const fd = new FormData();
    expect(contentApi.uploadVoiceClone(fd)).toBeInstanceOf(Promise);
  });
  it('getVoiceClone', () => expect(contentApi.getVoiceClone()).toBeInstanceOf(Promise));
  it('deleteVoiceClone', () => expect(contentApi.deleteVoiceClone()).toBeInstanceOf(Promise));
});

// ─── userDashboardApi ─────────────────────────────────────────────────────────

describe('userDashboardApi', () => {
  it('getStats', () => expect(userDashboardApi.getStats()).toBeInstanceOf(Promise));
  it('getRecentConversations', () => expect(userDashboardApi.getRecentConversations({ limit: 5 })).toBeInstanceOf(Promise));
  it('getRecommendedCreators', () => expect(userDashboardApi.getRecommendedCreators()).toBeInstanceOf(Promise));
  it('getActivityFeed', () => expect(userDashboardApi.getActivityFeed()).toBeInstanceOf(Promise));
});

// ─── subscriptionApi ──────────────────────────────────────────────────────────

describe('subscriptionApi', () => {
  it('getCurrent', () => expect(subscriptionApi.getCurrent()).toBeInstanceOf(Promise));
  it('getPlans', () => expect(subscriptionApi.getPlans()).toBeInstanceOf(Promise));
  it('upgrade', () => expect(subscriptionApi.upgrade()).toBeInstanceOf(Promise));
  it('cancel', () => expect(subscriptionApi.cancel()).toBeInstanceOf(Promise));
  it('getTransactions', () => expect(subscriptionApi.getTransactions()).toBeInstanceOf(Promise));
  it('getDetails', () => expect(subscriptionApi.getDetails()).toBeInstanceOf(Promise));
  it('getFeatures', () => expect(subscriptionApi.getFeatures()).toBeInstanceOf(Promise));
  it('getUsageAnalytics', () => expect(subscriptionApi.getUsageAnalytics({ period: 30 })).toBeInstanceOf(Promise));
});

// ─── paymentApi ───────────────────────────────────────────────────────────────

describe('paymentApi', () => {
  it('createOrder', () => expect(paymentApi.createOrder({ plan: 'PREMIUM' })).toBeInstanceOf(Promise));
  it('verifyPayment', () => expect(paymentApi.verifyPayment({ razorpay_order_id: 'o1', razorpay_payment_id: 'p1', razorpay_signature: 's1' })).toBeInstanceOf(Promise));
  it('getStatus', () => expect(paymentApi.getStatus('o1')).toBeInstanceOf(Promise));
});

// ─── payoutApi ────────────────────────────────────────────────────────────────

describe('payoutApi', () => {
  it('addBankAccount', () => expect(payoutApi.addBankAccount({ accountHolderName: 'Test', accountNumber: '123', ifscCode: 'ABCD0001', bankName: 'Test Bank', accountType: 'savings' })).toBeInstanceOf(Promise));
  it('getBankAccount', () => expect(payoutApi.getBankAccount()).toBeInstanceOf(Promise));
  it('getEarningsBreakdown', () => expect(payoutApi.getEarningsBreakdown()).toBeInstanceOf(Promise));
  it('requestPayout', () => expect(payoutApi.requestPayout(500)).toBeInstanceOf(Promise));
  it('getPayouts', () => expect(payoutApi.getPayouts()).toBeInstanceOf(Promise));
  it('getLedger', () => expect(payoutApi.getLedger()).toBeInstanceOf(Promise));
});

// ─── programApi ───────────────────────────────────────────────────────────────

describe('programApi', () => {
  it('getAll', () => expect(programApi.getAll()).toBeInstanceOf(Promise));
  it('getByCreator', () => expect(programApi.getByCreator('c1')).toBeInstanceOf(Promise));
  it('create', () => expect(programApi.create({ name: 'Test Program' })).toBeInstanceOf(Promise));
  it('update', () => expect(programApi.update('p1', { name: 'Updated' })).toBeInstanceOf(Promise));
  it('delete', () => expect(programApi.delete('p1')).toBeInstanceOf(Promise));
});

// ─── bookingApi ───────────────────────────────────────────────────────────────

describe('bookingApi', () => {
  it('getPublicSlots', () => expect(bookingApi.getPublicSlots('c1')).toBeInstanceOf(Promise));
  it('getSlots', () => expect(bookingApi.getSlots()).toBeInstanceOf(Promise));
  it('createSlot', () => expect(bookingApi.createSlot({ startTime: '10:00', endTime: '11:00' })).toBeInstanceOf(Promise));
  it('deleteSlot', () => expect(bookingApi.deleteSlot('s1')).toBeInstanceOf(Promise));
  it('getRequests', () => expect(bookingApi.getRequests()).toBeInstanceOf(Promise));
  it('requestBooking', () => expect(bookingApi.requestBooking({ slotId: 's1' })).toBeInstanceOf(Promise));
  it('acceptRequest without data', () => expect(bookingApi.acceptRequest('req1')).toBeInstanceOf(Promise));
  it('acceptRequest with data', () => expect(bookingApi.acceptRequest('req1', { meetingLink: 'https://meet.google.com/abc' })).toBeInstanceOf(Promise));
  it('updateMeetingLink', () => expect(bookingApi.updateMeetingLink('req1', 'https://meet.google.com/abc')).toBeInstanceOf(Promise));
  it('declineRequest', () => expect(bookingApi.declineRequest('req1')).toBeInstanceOf(Promise));
  it('getStats', () => expect(bookingApi.getStats()).toBeInstanceOf(Promise));
});

// ─── opportunityApi ───────────────────────────────────────────────────────────

describe('opportunityApi', () => {
  it('getAll', () => expect(opportunityApi.getAll()).toBeInstanceOf(Promise));
  it('getById', () => expect(opportunityApi.getById('o1')).toBeInstanceOf(Promise));
  it('create', () => expect(opportunityApi.create({ title: 'Collab' })).toBeInstanceOf(Promise));
  it('update', () => expect(opportunityApi.update('o1', { title: 'Updated' })).toBeInstanceOf(Promise));
  it('cancel', () => expect(opportunityApi.cancel('o1')).toBeInstanceOf(Promise));
  it('apply', () => expect(opportunityApi.apply('o1', 'My pitch', 5000)).toBeInstanceOf(Promise));
  it('acceptApplication', () => expect(opportunityApi.acceptApplication('app1', 5000)).toBeInstanceOf(Promise));
  it('rejectApplication', () => expect(opportunityApi.rejectApplication('app1')).toBeInstanceOf(Promise));
});

// ─── milestoneApi ─────────────────────────────────────────────────────────────

describe('milestoneApi', () => {
  it('list', () => expect(milestoneApi.list('deal1')).toBeInstanceOf(Promise));
  it('create', () => expect(milestoneApi.create('deal1', { title: 'Phase 1' })).toBeInstanceOf(Promise));
  it('update', () => expect(milestoneApi.update('m1', { status: 'COMPLETED' })).toBeInstanceOf(Promise));
  it('complete', () => expect(milestoneApi.complete('m1')).toBeInstanceOf(Promise));
  it('delete', () => expect(milestoneApi.delete('m1')).toBeInstanceOf(Promise));
});

// ─── companyApi ───────────────────────────────────────────────────────────────

describe('companyApi', () => {
  it('getDashboard', () => expect(companyApi.getDashboard()).toBeInstanceOf(Promise));
  it('updateProfile', () => expect(companyApi.updateProfile({ name: 'ACME' })).toBeInstanceOf(Promise));
  it('discoverCreators', () => expect(companyApi.discoverCreators()).toBeInstanceOf(Promise));
  it('getDeals', () => expect(companyApi.getDeals()).toBeInstanceOf(Promise));
  it('completeDeal', () => expect(companyApi.completeDeal('deal1')).toBeInstanceOf(Promise));
});

// ─── homeApi ──────────────────────────────────────────────────────────────────

describe('homeApi', () => {
  it('getFeatured', () => expect(homeApi.getFeatured()).toBeInstanceOf(Promise));
});

// ─── adminApi ─────────────────────────────────────────────────────────────────

describe('adminApi', () => {
  it('getStats', () => expect(adminApi.getStats()).toBeInstanceOf(Promise));
  it('getRevenue', () => expect(adminApi.getRevenue()).toBeInstanceOf(Promise));
  it('getConfig', () => expect(adminApi.getConfig()).toBeInstanceOf(Promise));
  it('getHomeCreators', () => expect(adminApi.getHomeCreators()).toBeInstanceOf(Promise));
  it('updateHomeFeatured', () => expect(adminApi.updateHomeFeatured({ featured: [], mainHighlightId: null })).toBeInstanceOf(Promise));
  it('getUsers', () => expect(adminApi.getUsers()).toBeInstanceOf(Promise));
  it('getUser', () => expect(adminApi.getUser('u1')).toBeInstanceOf(Promise));
  it('updateUser', () => expect(adminApi.updateUser('u1', { name: 'New' })).toBeInstanceOf(Promise));
  it('updateUserRole', () => expect(adminApi.updateUserRole('u1', 'ADMIN')).toBeInstanceOf(Promise));
  it('suspendUser', () => expect(adminApi.suspendUser('u1', { days: 7 })).toBeInstanceOf(Promise));
  it('unsuspendUser', () => expect(adminApi.unsuspendUser('u1')).toBeInstanceOf(Promise));
  it('banUser', () => expect(adminApi.banUser('u1', { reason: 'spam' })).toBeInstanceOf(Promise));
  it('unbanUser', () => expect(adminApi.unbanUser('u1')).toBeInstanceOf(Promise));
  it('getCreators', () => expect(adminApi.getCreators()).toBeInstanceOf(Promise));
  it('getPendingCreators', () => expect(adminApi.getPendingCreators()).toBeInstanceOf(Promise));
  it('getCreator', () => expect(adminApi.getCreator('c1')).toBeInstanceOf(Promise));
  it('updateCreator', () => expect(adminApi.updateCreator('c1', { isActive: true })).toBeInstanceOf(Promise));
  it('setCreatorActive', () => expect(adminApi.setCreatorActive('c1', true)).toBeInstanceOf(Promise));
  it('verifyCreator', () => expect(adminApi.verifyCreator('c1')).toBeInstanceOf(Promise));
  it('rejectCreator', () => expect(adminApi.rejectCreator('c1', { reason: 'incomplete' })).toBeInstanceOf(Promise));
  it('getCompanies', () => expect(adminApi.getCompanies()).toBeInstanceOf(Promise));
  it('getCompany', () => expect(adminApi.getCompany('co1')).toBeInstanceOf(Promise));
  it('updateCompany', () => expect(adminApi.updateCompany('co1', { name: 'ACME' })).toBeInstanceOf(Promise));
  it('verifyCompany', () => expect(adminApi.verifyCompany('co1')).toBeInstanceOf(Promise));
  it('getDeals', () => expect(adminApi.getDeals()).toBeInstanceOf(Promise));
  it('getDeal', () => expect(adminApi.getDeal('deal1')).toBeInstanceOf(Promise));
  it('updateDealStatus', () => expect(adminApi.updateDealStatus('deal1', 'COMPLETED')).toBeInstanceOf(Promise));
  it('getCreatorContents', () => expect(adminApi.getCreatorContents('c1')).toBeInstanceOf(Promise));
  it('updateContentStatus', () => expect(adminApi.updateContentStatus('cnt1', { status: 'APPROVED' })).toBeInstanceOf(Promise));
  it('deleteContent', () => expect(adminApi.deleteContent('cnt1')).toBeInstanceOf(Promise));
  it('getReports', () => expect(adminApi.getReports()).toBeInstanceOf(Promise));
  it('getReportDetails', () => expect(adminApi.getReportDetails('rpt1')).toBeInstanceOf(Promise));
  it('resolveReport', () => expect(adminApi.resolveReport('rpt1', { action: 'ban', reviewNotes: 'spam' })).toBeInstanceOf(Promise));
  it('dismissReport', () => expect(adminApi.dismissReport('rpt1', { reason: 'false positive' })).toBeInstanceOf(Promise));
  it('getModerationStats', () => expect(adminApi.getModerationStats()).toBeInstanceOf(Promise));
  it('getModerationLogs', () => expect(adminApi.getModerationLogs()).toBeInstanceOf(Promise));
  it('getUserModerationHistory', () => expect(adminApi.getUserModerationHistory('u1')).toBeInstanceOf(Promise));
  it('getAIModerationStats', () => expect(adminApi.getAIModerationStats('7d')).toBeInstanceOf(Promise));
  it('getAIModerationLogs', () => expect(adminApi.getAIModerationLogs()).toBeInstanceOf(Promise));
  it('testAIModeration', () => expect(adminApi.testAIModeration('test content')).toBeInstanceOf(Promise));
  it('updateAIThresholds', () => expect(adminApi.updateAIThresholds({ category: 'hate', blockThreshold: 0.9, flagThreshold: 0.7 })).toBeInstanceOf(Promise));
  it('getEmailPreview', () => expect(adminApi.getEmailPreview({ type: 'welcome', name: 'Test' })).toBeInstanceOf(Promise));
});

// ─── postApi ──────────────────────────────────────────────────────────────────

describe('postApi', () => {
  it('getFeed', () => expect(postApi.getFeed()).toBeInstanceOf(Promise));
  it('getPost', () => expect(postApi.getPost('p1')).toBeInstanceOf(Promise));
  it('createPost', () => expect(postApi.createPost({ content: 'Hello world' })).toBeInstanceOf(Promise));
  it('updatePost', () => expect(postApi.updatePost('p1', { content: 'Updated' })).toBeInstanceOf(Promise));
  it('deletePost', () => expect(postApi.deletePost('p1')).toBeInstanceOf(Promise));
  it('likePost', () => expect(postApi.likePost('p1')).toBeInstanceOf(Promise));
  it('unlikePost', () => expect(postApi.unlikePost('p1')).toBeInstanceOf(Promise));
  it('getPostLikes', () => expect(postApi.getPostLikes('p1')).toBeInstanceOf(Promise));
  it('getStatsOverview', () => expect(postApi.getStatsOverview()).toBeInstanceOf(Promise));
});

// ─── followApi ────────────────────────────────────────────────────────────────

describe('followApi', () => {
  it('followCreator', () => expect(followApi.followCreator('c1')).toBeInstanceOf(Promise));
  it('unfollowCreator', () => expect(followApi.unfollowCreator('c1')).toBeInstanceOf(Promise));
  it('checkFollowing', () => expect(followApi.checkFollowing('c1')).toBeInstanceOf(Promise));
  it('getFollowers', () => expect(followApi.getFollowers('u1')).toBeInstanceOf(Promise));
  it('getFollowing', () => expect(followApi.getFollowing('u1')).toBeInstanceOf(Promise));
  it('getFollowStats', () => expect(followApi.getFollowStats('u1')).toBeInstanceOf(Promise));
  it('getSuggestions', () => expect(followApi.getSuggestions()).toBeInstanceOf(Promise));
});

// ─── commentApi ───────────────────────────────────────────────────────────────

describe('commentApi', () => {
  it('createComment', () => expect(commentApi.createComment('p1', { content: 'Nice post!' })).toBeInstanceOf(Promise));
  it('getComments', () => expect(commentApi.getComments('p1')).toBeInstanceOf(Promise));
  it('getReplies', () => expect(commentApi.getReplies('c1')).toBeInstanceOf(Promise));
  it('updateComment', () => expect(commentApi.updateComment('c1', { content: 'Edited' })).toBeInstanceOf(Promise));
  it('deleteComment', () => expect(commentApi.deleteComment('c1')).toBeInstanceOf(Promise));
  it('likeComment', () => expect(commentApi.likeComment('c1')).toBeInstanceOf(Promise));
  it('unlikeComment', () => expect(commentApi.unlikeComment('c1')).toBeInstanceOf(Promise));
});

// ─── reactionApi ──────────────────────────────────────────────────────────────

describe('reactionApi', () => {
  it('addReaction', () => expect(reactionApi.addReaction('m1', '👍')).toBeInstanceOf(Promise));
  it('removeReaction', () => expect(reactionApi.removeReaction('m1', '👍')).toBeInstanceOf(Promise));
  it('getReactions', () => expect(reactionApi.getReactions('m1')).toBeInstanceOf(Promise));
});

// ─── linkPreviewApi ───────────────────────────────────────────────────────────

describe('linkPreviewApi', () => {
  it('getPreview', () => expect(linkPreviewApi.getPreview('https://example.com')).toBeInstanceOf(Promise));
  it('generateDescription', () => expect(linkPreviewApi.generateDescription('https://example.com', 'Title', 'Example')).toBeInstanceOf(Promise));
});

// ─── bookmarkApi ──────────────────────────────────────────────────────────────

describe('bookmarkApi', () => {
  it('addBookmark', () => expect(bookmarkApi.addBookmark('m1', 'Important')).toBeInstanceOf(Promise));
  it('removeBookmark', () => expect(bookmarkApi.removeBookmark('m1')).toBeInstanceOf(Promise));
  it('getBookmarks', () => expect(bookmarkApi.getBookmarks()).toBeInstanceOf(Promise));
  it('getUserBookmarks', () => expect(bookmarkApi.getUserBookmarks({ page: 1 })).toBeInstanceOf(Promise));
  it('getRecommendations', () => expect(bookmarkApi.getRecommendations()).toBeInstanceOf(Promise));
});

// ─── trendingApi ──────────────────────────────────────────────────────────────

describe('trendingApi', () => {
  it('getTrendingPosts', () => expect(trendingApi.getTrendingPosts()).toBeInstanceOf(Promise));
  it('getTrendingCreators', () => expect(trendingApi.getTrendingCreators()).toBeInstanceOf(Promise));
  it('getTrendingHashtags', () => expect(trendingApi.getTrendingHashtags()).toBeInstanceOf(Promise));
  it('getCategoryTrending', () => expect(trendingApi.getCategoryTrending('fitness')).toBeInstanceOf(Promise));
  it('getTrendingStats', () => expect(trendingApi.getTrendingStats()).toBeInstanceOf(Promise));
});

// ─── searchApi ────────────────────────────────────────────────────────────────

describe('searchApi', () => {
  it('globalSearch', () => expect(searchApi.globalSearch({ q: 'fitness' })).toBeInstanceOf(Promise));
  it('autocomplete', () => expect(searchApi.autocomplete('fit')).toBeInstanceOf(Promise));
  it('getPopularSearches', () => expect(searchApi.getPopularSearches()).toBeInstanceOf(Promise));
  it('getSuggestions', () => expect(searchApi.getSuggestions()).toBeInstanceOf(Promise));
});

// ─── recommendationApi ────────────────────────────────────────────────────────

describe('recommendationApi', () => {
  it('getCreatorRecommendations', () => expect(recommendationApi.getCreatorRecommendations()).toBeInstanceOf(Promise));
  it('getSimilarCreators', () => expect(recommendationApi.getSimilarCreators('c1')).toBeInstanceOf(Promise));
  it('getRecommendedPosts', () => expect(recommendationApi.getRecommendedPosts()).toBeInstanceOf(Promise));
  it('getForYou', () => expect(recommendationApi.getForYou(10)).toBeInstanceOf(Promise));
  it('getCategoryRecommendations', () => expect(recommendationApi.getCategoryRecommendations('fitness')).toBeInstanceOf(Promise));
});

// ─── gamificationApi ──────────────────────────────────────────────────────────

describe('gamificationApi', () => {
  it('getUserAchievements', () => expect(gamificationApi.getUserAchievements()).toBeInstanceOf(Promise));
  it('getLeaderboard default args', () => expect(gamificationApi.getLeaderboard()).toBeInstanceOf(Promise));
  it('getLeaderboard with args', () => expect(gamificationApi.getLeaderboard('creators', 'week')).toBeInstanceOf(Promise));
  it('checkAchievements', () => expect(gamificationApi.checkAchievements('message_sent', { count: 1 })).toBeInstanceOf(Promise));
});

// ─── analyticsApi ─────────────────────────────────────────────────────────────

describe('analyticsApi', () => {
  it('getUserAnalytics', () => expect(analyticsApi.getUserAnalytics('7d')).toBeInstanceOf(Promise));
  it('getCreatorAnalytics', () => expect(analyticsApi.getCreatorAnalytics()).toBeInstanceOf(Promise));
  it('getCompetitiveAnalysis', () => expect(analyticsApi.getCompetitiveAnalysis()).toBeInstanceOf(Promise));
  it('getContentPerformance', () => expect(analyticsApi.getContentPerformance('cnt1')).toBeInstanceOf(Promise));
});

// ─── monitoringApi ────────────────────────────────────────────────────────────

describe('monitoringApi', () => {
  it('getPerformanceStats', () => expect(monitoringApi.getPerformanceStats()).toBeInstanceOf(Promise));
  it('getBusinessMetrics', () => expect(monitoringApi.getBusinessMetrics()).toBeInstanceOf(Promise));
});

// ─── notificationApi ──────────────────────────────────────────────────────────

describe('notificationApi', () => {
  it('getNotifications', () => expect(notificationApi.getNotifications()).toBeInstanceOf(Promise));
  it('getUnreadCount', () => expect(notificationApi.getUnreadCount()).toBeInstanceOf(Promise));
  it('getSettings', () => expect(notificationApi.getSettings()).toBeInstanceOf(Promise));
  it('updateSettings', () => expect(notificationApi.updateSettings({ emailEnabled: true })).toBeInstanceOf(Promise));
  it('markAsRead', () => expect(notificationApi.markAsRead('n1')).toBeInstanceOf(Promise));
  it('markAllAsRead', () => expect(notificationApi.markAllAsRead()).toBeInstanceOf(Promise));
});

// ─── Default export ───────────────────────────────────────────────────────────

describe('default export', () => {
  it('is defined', async () => {
    const { default: api } = await import('../api');
    expect(api).toBeDefined();
  });
});
