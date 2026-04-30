import { queryClient, queryKeys } from '../queryClient';

describe('queryClient', () => {
  it('creates a QueryClient instance', () => {
    expect(queryClient).toBeDefined();
  });

  it('has correct staleTime', () => {
    const options = queryClient.getDefaultOptions();
    expect(options.queries?.staleTime).toBe(1000 * 60 * 5);
  });
});

describe('queryKeys', () => {
  it('feed.all returns correct key', () => {
    expect(queryKeys.feed.all).toEqual(['feed']);
  });

  it('feed.personalized returns key with page and limit', () => {
    expect(queryKeys.feed.personalized(1, 20)).toEqual(['feed', 'personalized', { page: 1, limit: 20 }]);
  });

  it('posts.byId returns correct key', () => {
    expect(queryKeys.posts.byId('p1')).toEqual(['posts', 'p1']);
  });

  it('creators.byId returns correct key', () => {
    expect(queryKeys.creators.byId('c1')).toEqual(['creators', 'c1']);
  });

  it('trending.posts uses default timeframe', () => {
    expect(queryKeys.trending.posts()).toEqual(['trending', 'posts', '24h']);
  });

  it('chat.messages returns correct key', () => {
    expect(queryKeys.chat.messages('conv-1')).toEqual(['chat', 'messages', 'conv-1']);
  });

  it('queryKeys.retryDelay function works', () => {
    const options = queryClient.getDefaultOptions();
    const retryDelay = options.queries?.retryDelay;
    if (typeof retryDelay === 'function') {
      expect(retryDelay(0, new Error())).toBe(1000);
      expect(retryDelay(1, new Error())).toBe(2000);
    }
  });
});
