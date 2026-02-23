'use client';

import { useState, useCallback } from 'react';
import { IPost, PostFormData, PostsQuery, PostsMeta } from '@/types/post.types';

export function usePosts() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState<PostsMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (query: PostsQuery = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(query.page ?? 1),
        limit: String(query.limit ?? 10),
        ...(query.search ? { search: query.search } : {}),
      });
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPosts(data.data);
      setMeta(data.meta ?? null);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserPosts = useCallback(async (authorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts?author=${authorId}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPosts(data.data);
      setMeta(data.meta ?? null);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData: PostFormData): Promise<IPost> => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data as IPost;
  }, []);

  const updatePost = useCallback(
    async (id: string, postData: Partial<PostFormData>): Promise<IPost> => {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...data.data } : p))
      );
      return data.data as IPost;
    },
    []
  );

  const deletePost = useCallback(async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // Optimistic update
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const toggleLike = useCallback(
    async (id: string): Promise<{ likes: number; liked: boolean }> => {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    },
    []
  );

  return {
    posts,
    isLoading,
    meta,
    error,
    fetchPosts,
    fetchUserPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
  };
}
