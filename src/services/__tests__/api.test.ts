vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockInstance),
    defaults: {},
  };
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
  return { default: mockAxios };
});

import { getImageUrl, getDownloadUrl } from '../api';

describe('getImageUrl', () => {
  it('returns empty string for undefined', () => {
    expect(getImageUrl(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getImageUrl('')).toBe('');
  });

  it('returns absolute URLs unchanged', () => {
    expect(getImageUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
  });

  it('returns http URLs unchanged', () => {
    expect(getImageUrl('http://example.com/image.png')).toBe('http://example.com/image.png');
  });

  it('handles relative paths', () => {
    const result = getImageUrl('/some/image.jpg');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles paths without leading slash', () => {
    const result = getImageUrl('some/image.jpg');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getDownloadUrl', () => {
  it('returns empty string when filename is undefined', () => {
    expect(getDownloadUrl('content', undefined)).toBe('');
  });

  it('returns empty string when filename is empty', () => {
    expect(getDownloadUrl('content', '')).toBe('');
  });

  it('returns absolute URLs unchanged', () => {
    expect(getDownloadUrl('content', 'https://example.com/file.pdf')).toBe('https://example.com/file.pdf');
  });

  it('builds download URL for relative filename', () => {
    const result = getDownloadUrl('content', 'file.pdf');
    expect(result).toContain('download');
    expect(result).toContain('content');
    expect(result).toContain('file.pdf');
  });

  it('strips leading slashes from filename', () => {
    const result = getDownloadUrl('images', '/photo.jpg');
    expect(result).not.toContain('//');
    expect(result).toContain('photo.jpg');
  });

  it('strips slashes from folder', () => {
    const result = getDownloadUrl('/content/', 'file.pdf');
    expect(result).toContain('content');
    expect(result).toContain('file.pdf');
  });
});

describe('api exports', () => {
  it('exports authApi', async () => {
    const { authApi } = await import('../api');
    expect(authApi).toBeDefined();
    expect(typeof authApi.login).toBe('function');
    expect(typeof authApi.register).toBe('function');
  });

  it('exports userApi', async () => {
    const { userApi } = await import('../api');
    expect(userApi).toBeDefined();
    expect(typeof userApi.getProfile).toBe('function');
  });

  it('exports creatorApi', async () => {
    const { creatorApi } = await import('../api');
    expect(creatorApi).toBeDefined();
    expect(typeof creatorApi.getAll).toBe('function');
  });

  it('exports chatApi', async () => {
    const { chatApi } = await import('../api');
    expect(chatApi).toBeDefined();
    expect(typeof chatApi.sendMessage).toBe('function');
  });

  it('exports postApi', async () => {
    const { postApi } = await import('../api');
    expect(postApi).toBeDefined();
    expect(typeof postApi.createPost).toBe('function');
  });

  it('exports analyticsApi', async () => {
    const { analyticsApi } = await import('../api');
    expect(analyticsApi).toBeDefined();
  });

  it('exports default api instance', async () => {
    const { default: api } = await import('../api');
    expect(api).toBeDefined();
  });
});
