'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Author { _id: string; name: string; email: string; }
interface Comment { _id: string; user: Author; text: string; createdAt: string; }
interface Post {
  _id: string; title: string; slug: string; content: string;
  coverImage?: string; author: Author; likes: string[];
  comments: Comment[]; createdAt: string; updatedAt: string;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likes, setLikes] = useState<string[]>([]);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts?limit=200`);
        const data = await res.json();
        const found = data.data?.find((p: Post) => p.slug === slug);
        if (!found) { router.push('/blog'); return; }

        const res2 = await fetch(`/api/posts/${found._id}`);
        const d2 = await res2.json();
        setPost(d2.data);
        setLikes(d2.data.likes ?? []);
        setComments(d2.data.comments ?? []);
      } catch {
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug, router]);

  const isLiked = user ? likes.some(id => id === user._id || (typeof id === 'object' && (id as unknown as {$oid?: string})?.toString() === user._id)) : false;
  const isOwner = user && post ? user._id === post.author._id : false;

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like posts'); return; }
    if (!post || liking) return;
    setLiking(true);
    const wasLiked = isLiked;
    setLikes(prev => wasLiked ? prev.filter(id => id !== user._id) : [...prev, user._id]);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.data.liked ? 'Post liked! ❤️' : 'Like removed');
    } catch {
      setLikes(prev => wasLiked ? [...prev, user._id] : prev.filter(id => id !== user._id));
      toast.error('Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to comment'); return; }
    if (!commentText.trim() || !post) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setComments(prev => [...prev, {
        _id: data.data._id,
        user: { _id: user._id, name: user.name, email: user.email },
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
      }]);
      setCommentText('');
      toast.success('Comment added! 💬');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`/api/posts/${post._id}/comment?commentId=${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
    finally { setDeletingCommentId(null); }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6 py-8">
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />)}
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-3xl mx-auto">
      {post.coverImage && (
        <div className="relative h-72 md:h-96 mb-10 rounded-2xl overflow-hidden shadow-lg">
          <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" sizes="768px" />
        </div>
      )}

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {post.author.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
              <p className="text-sm text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={liking}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all select-none',
                isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                liking ? 'opacity-60 cursor-wait' : 'cursor-pointer',
              ].join(' ')}
            >
              <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
              <span>{likes.length} {likes.length === 1 ? 'Like' : 'Likes'}</span>
            </button>
            {isOwner && (
              <Link href={`/blog/edit/${post._id}`}>
                <Button size="sm" variant="secondary">✏️ Edit Post</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div
        className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-900"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <hr className="border-gray-200 dark:border-gray-700 mb-10" />

      {/* Comments */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          💬 Comments ({comments.length})
        </h2>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" size="sm" isLoading={submittingComment} disabled={!commentText.trim()}>
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <Link href="/login" className="font-semibold hover:underline">Login</Link>{' '}to join the conversation
            </p>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-4xl mb-2">💬</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {comment.user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{comment.user?.name}</p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {user && user._id === comment.user?._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={deletingCommentId === comment._id}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingCommentId === comment._id ? '...' : '🗑️ Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 break-words">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
          ← Back to all posts
        </Link>
      </div>
    </article>
  );
}
