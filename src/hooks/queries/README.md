# React Query Hooks Documentation

## Overview

This directory contains React Query hooks for efficient data fetching, caching, and state management across the AI Creator Platform. React Query provides automatic caching, background refetching, and optimistic updates.

## Configuration

The query client is configured in `/src/config/queryClient.ts` with the following defaults:

- **Stale Time:** 5 minutes (data considered fresh)
- **GC Time:** 30 minutes (cache garbage collection)
- **Retry:** 2 attempts with exponential backoff
- **Refetch on:** Window focus, reconnect, and mount

## Available Hooks

### Feed Hooks (`useFeed.ts`)

#### `useFeed(page, limit)`
Fetches personalized feed with pagination.

```typescript
import { useFeed } from '../hooks/queries';

const MyComponent = () => {
  const { data, isLoading, error, refetch } = useFeed(1, 20);

  if (isLoading) return <Loader />;
  if (error) return <Error />;

  const posts = data?.data?.posts || [];
  return <div>{/* Render posts */}</div>;
};
```

#### `useInfiniteFeed(limit)`
Infinite scroll feed implementation.

```typescript
import { useInfiniteFeed } from '../hooks/queries';

const Feed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteFeed(10);

  const posts = data?.pages.flatMap((page) => page.data?.posts || []) || [];

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
    >
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </InfiniteScroll>
  );
};
```

### Post Hooks (`usePosts.ts`)

#### `usePost(postId)`
Fetch single post by ID.

```typescript
const { data, isLoading } = usePost(postId);
const post = data?.data;
```

#### `useCreatorPosts(creatorId, page)`
Fetch posts by creator with pagination.

```typescript
const { data } = useCreatorPosts('creator-123', 1);
const posts = data?.data?.posts || [];
```

#### `usePostComments(postId, page)`
Fetch comments for a post.

```typescript
const { data } = usePostComments(postId, 1);
const comments = data?.data?.comments || [];
```

#### Mutation Hooks

##### `useLikePost()`
Like a post with optimistic updates.

```typescript
const likeMutation = useLikePost();

const handleLike = (postId: string) => {
  likeMutation.mutate(postId);
};
```

##### `useUnlikePost()`
Unlike a post with optimistic updates.

```typescript
const unlikeMutation = useUnlikePost();

const handleUnlike = (postId: string) => {
  unlikeMutation.mutate(postId);
};
```

##### `useAddComment()`
Add comment to a post.

```typescript
const addCommentMutation = useAddComment();

const handleAddComment = (postId: string, content: string, parentId?: string) => {
  addCommentMutation.mutate({ postId, content, parentId });
};
```

##### `useDeleteComment()`
Delete a comment.

```typescript
const deleteCommentMutation = useDeleteComment();

const handleDeleteComment = (commentId: string, postId: string) => {
  deleteCommentMutation.mutate({ commentId, postId });
};
```

##### `useCreatePost()`
Create a new post.

```typescript
const createPostMutation = useCreatePost();

const handleCreatePost = (formData: FormData) => {
  createPostMutation.mutate(formData, {
    onSuccess: () => {
      message.success('Post created!');
    },
  });
};
```

##### `useDeletePost()`
Delete a post.

```typescript
const deletePostMutation = useDeletePost();

const handleDeletePost = (postId: string) => {
  deletePostMutation.mutate(postId);
};
```

### Creator Hooks (`useCreators.ts`)

#### `useCreators(page, filters)`
Fetch creators list with optional filters.

```typescript
const { data } = useCreators(1, { category: 'FITNESS' });
const creators = data?.data?.creators || [];
```

#### `useCreator(creatorId)`
Fetch single creator profile.

```typescript
const { data, isLoading } = useCreator(creatorId);
const creator = data?.data;
```

#### `useRecommendedCreators(userId, limit)`
Fetch personalized creator recommendations.

```typescript
const { data } = useRecommendedCreators(userId, 10);
const recommended = data?.data?.creators || [];
```

#### `useSimilarCreators(creatorId, limit)`
Fetch creators similar to a given creator.

```typescript
const { data } = useSimilarCreators(creatorId, 6);
const similar = data?.data?.creators || [];
```

#### Mutation Hooks

##### `useFollowCreator()`
Follow a creator with optimistic updates.

```typescript
const followMutation = useFollowCreator();

const handleFollow = (creatorId: string) => {
  followMutation.mutate(creatorId);
};
```

##### `useUnfollowCreator()`
Unfollow a creator with optimistic updates.

```typescript
const unfollowMutation = useUnfollowCreator();

const handleUnfollow = (creatorId: string) => {
  unfollowMutation.mutate(creatorId);
};
```

### Trending Hooks (`useTrending.ts`)

#### `useTrendingPosts(timeframe, limit)`
Fetch trending posts.

```typescript
const { data } = useTrendingPosts('24h', 20); // '24h', '7d', '30d'
const trendingPosts = data?.data?.posts || [];
```

#### `useTrendingCreators(timeframe, limit)`
Fetch trending creators.

```typescript
const { data } = useTrendingCreators('7d', 10);
const trendingCreators = data?.data?.creators || [];
```

#### `useTrendingHashtags(timeframe, limit)`
Fetch trending hashtags.

```typescript
const { data } = useTrendingHashtags('24h', 20);
const trending = data?.data?.hashtags || [];
```

### Search Hooks (`useSearch.ts`)

#### `useSearch(query, type, page)`
Global search across creators, posts, and users.

```typescript
const { data, isLoading } = useSearch('fitness', 'creator', 1);
const results = data?.data?.results || [];
```

#### `useSearchAutocomplete(query, limit)`
Search autocomplete suggestions.

```typescript
const { data } = useSearchAutocomplete('fit', 10);
const suggestions = data?.data?.suggestions || [];
```

### User Hooks (`useUser.ts`)

#### `useUserProfile(userId)`
Fetch user profile.

```typescript
const { data } = useUserProfile(userId);
const profile = data?.data;
```

#### `useUserFollowers(userId, page)`
Fetch user's followers.

```typescript
const { data } = useUserFollowers(userId, 1);
const followers = data?.data?.followers || [];
```

#### `useUserFollowing(userId, page)`
Fetch users being followed.

```typescript
const { data } = useUserFollowing(userId, 1);
const following = data?.data?.following || [];
```

#### `useUserInterests(userId)`
Fetch user's interests.

```typescript
const { data } = useUserInterests(userId);
const interests = data?.data?.interests || [];
```

#### Mutation Hooks

##### `useUpdateInterests()`
Update user interests.

```typescript
const updateInterestsMutation = useUpdateInterests();

const handleUpdateInterests = (userId: string, interests: string[]) => {
  updateInterestsMutation.mutate({ userId, interests });
};
```

## Query Keys

All query keys are defined in `/src/config/queryClient.ts` using the `queryKeys` factory. This ensures consistent cache key management across the app.

```typescript
import { queryKeys } from '../../config/queryClient';

// Examples:
queryKeys.feed.personalized(1, 20);
queryKeys.posts.byId('post-123');
queryKeys.creators.recommended('user-456');
```

## Optimistic Updates

Mutations like `useLikePost`, `useFollowCreator`, etc., implement optimistic updates:

1. **onMutate:** Update cache immediately with expected result
2. **onError:** Rollback to previous state if mutation fails
3. **onSettled:** Invalidate related queries to refetch latest data

Example:
```typescript
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/api/posts/${postId}/like`);
      return response.data;
    },
    onMutate: async (postId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.byId(postId) });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(queryKeys.posts.byId(postId));

      // Optimistically update
      queryClient.setQueryData(queryKeys.posts.byId(postId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          isLiked: true,
          likesCount: (old?.data?.likesCount || 0) + 1,
        },
      }));

      return { previousPost };
    },
    onError: (err, postId, context: any) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.posts.byId(postId), context.previousPost);
    },
    onSettled: (data, error, postId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byId(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};
```

## Cache Invalidation

Use `invalidateQueries` to refetch data after mutations:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });

// Invalidate by pattern
queryClient.invalidateQueries({ queryKey: ['posts'] });
```

## React Query DevTools

Development builds include React Query DevTools (bottom-right floating button):

- View all cached queries
- Inspect query states
- Manually refetch or invalidate queries
- Debug cache behavior

## Best Practices

1. **Always use query keys from `queryKeys` factory** - ensures consistency
2. **Enable queries conditionally** - use `enabled` option when data depends on conditions
3. **Set appropriate stale times** - frequently changing data (feed) = shorter, static data (profile) = longer
4. **Handle loading and error states** - provide good UX with loaders and error messages
5. **Use optimistic updates for mutations** - instant feedback improves perceived performance
6. **Invalidate related queries** - ensure data consistency after mutations

## Performance Tips

1. **Prefetching:** Prefetch data on hover for instant navigation
```typescript
const queryClient = useQueryClient();

const handleHover = (creatorId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.creators.byId(creatorId),
    queryFn: () => api.get(`/api/creators/${creatorId}`),
  });
};
```

2. **Background refetching:** Automatically keeps data fresh
3. **Deduplication:** Multiple components using same query = single request
4. **Cache persistence:** Consider adding persistence plugin for offline support

## Troubleshooting

**Stale data after mutation:**
- Ensure `invalidateQueries` is called in `onSettled`
- Check query key matches exactly

**Queries not refetching:**
- Verify `refetchOnWindowFocus` and `refetchOnMount` settings
- Check if query is enabled

**Memory leaks:**
- Ensure components unmount properly
- React Query cleans up unused queries after `gcTime`

**Too many API calls:**
- Increase `staleTime` for static data
- Use `refetchOnMount: false` for very static data
