'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PostForm } from '@/components/blog/PostForm';
import { useAuth } from '@/hooks/useAuth';
import { IPost, PostFormData } from '@/types/post.types';
import toast from 'react-hot-toast';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<IPost | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (!res.ok) { toast.error('Post not found'); router.push('/dashboard'); return; }
        setPost(data.data);
      } catch {
        toast.error('Failed to load post');
        router.push('/dashboard');
      } finally {
        setIsFetching(false);
      }
    };
    fetchPost();
  }, [id, router]);

  useEffect(() => {
    if (post && user && post.author._id !== user._id) {
      toast.error('You can only edit your own posts');
      router.push('/dashboard');
    }
  }, [post, user, router]);

  const handleSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? 'Failed to update post');
      toast.success('Post updated successfully! ✅');
      router.push(`/blog/${result.data.slug}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isFetching) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4 py-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">✏️ Edit Post</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Changes will be live immediately after saving</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <PostForm
          initialData={{
            title: post.title,
            content: post.content,
            coverImage: post.coverImage ?? '',
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="💾 Save Changes"
        />
      </div>
    </div>
  );
}
