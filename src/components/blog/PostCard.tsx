'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { IPost } from '@/types/post.types';
import { stripHtml } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: IPost;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function PostCard({ post, onDelete, showActions = false }: PostCardProps) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
  const [liked, setLiked] = useState(
    post.likes?.some(id => String(id) === user?._id) ?? false
  );
  const [liking, setLiking] = useState(false);

  const isOwner = user?._id === post.author._id;
  const excerpt = stripHtml(post.content).substring(0, 140);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to like posts'); return; }
    if (liking) return;
    setLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch {
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
      toast.error('Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200">
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`}>
          <div className="relative h-48 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {post.author.name[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{post.author.name}</p>
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {excerpt}{excerpt.length >= 140 ? '...' : ''}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={liking}
            aria-label={liked ? 'Unlike' : 'Like'}
            className={[
              'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all select-none',
              liked
                ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
              liking ? 'opacity-60' : '',
            ].join(' ')}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>

          <div className="flex items-center gap-2">
            <Link href={`/blog/${post.slug}`}>
              <Button variant="ghost" size="sm">Read →</Button>
            </Link>
            {showActions && isOwner && (
              <>
                <Link href={`/blog/edit/${post._id}`}>
                  <Button variant="outline" size="sm">✏️ Edit</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => onDelete?.(post._id)}>
                  🗑️ Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
