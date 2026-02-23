'use client';

import { useEffect, useState, useCallback } from 'react';
import { PostCard } from '@/components/blog/PostCard';
import { SearchBar } from '@/components/blog/SearchBar';
import { SkeletonList } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { usePosts } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export default function BlogPage() {
  const { posts, isLoading, meta, fetchPosts } = usePosts();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 450);

  const load = useCallback((p: number, q: string) => {
    fetchPosts({ page: p, limit: 9, search: q }).catch(() =>
      toast.error('Failed to load posts')
    );
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
    load(1, debouncedSearch);
  }, [debouncedSearch, load]);

  useEffect(() => {
    load(page, debouncedSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Posts</h1>
          {meta && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {meta.total} {meta.total === 1 ? 'post' : 'posts'} published
            </p>
          )}
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {isLoading ? (
        <SkeletonList count={9} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={search ? '🔍' : '📭'}
          title={search ? `No results for "${search}"` : 'No posts yet'}
          description={search ? 'Try different keywords' : 'Be the first to write something!'}
          actionLabel={search ? undefined : 'Write a Post'}
          actionHref={search ? undefined : '/signup'}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" disabled={page <= 1 || isLoading} onClick={() => setPage(p => p - 1)}>
                ← Previous
              </Button>
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium px-2">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button variant="secondary" disabled={!meta.hasMore || isLoading} onClick={() => setPage(p => p + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
