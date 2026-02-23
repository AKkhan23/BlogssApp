'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/blog/PostForm';
import { usePosts } from '@/hooks/usePosts';
import { PostFormData } from '@/types/post.types';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { createPost } = usePosts();
  const router = useRouter();

  const handleSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const post = await createPost(data);
      toast.success('Post published! 🎉');
      router.push(`/blog/${post.slug}`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ✍️ Create New Post
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Share your ideas with the world
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <PostForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
