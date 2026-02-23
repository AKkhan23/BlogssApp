'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/blog/PostCard';
import { Modal } from '@/components/ui/Modal';
import { SkeletonList } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { posts, isLoading, fetchUserPosts, deletePost } = usePosts();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user?._id) {
      fetchUserPosts(user._id).catch(() => toast.error('Failed to load your posts'));
    }
  }, [user, fetchUserPosts]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePost(deleteTarget);
      toast.success('Post deleted successfully');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading) return <SkeletonList count={4} />;
  if (!isAuthenticated) return null;

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length ?? 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.comments?.length ?? 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👋 Welcome, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            You have{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{posts.length}</span>{' '}
            {posts.length === 1 ? 'post' : 'posts'} published
          </p>
        </div>
        <Link href="/blog/create">
          <Button size="md">+ New Post</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Posts', value: posts.length, icon: '📝' },
          { label: 'Total Likes', value: totalLikes, icon: '❤️' },
          { label: 'Comments', value: totalComments, icon: '💬' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <span className="text-2xl block mb-1">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="✍️"
          title="No posts yet"
          description="Start writing and share your thoughts with the world"
          actionLabel="Create Your First Post"
          actionHref="/blog/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              showActions
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        description="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete Post"
        isLoading={isDeleting}
      />
    </div>
  );
}
