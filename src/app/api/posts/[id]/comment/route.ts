import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import Post from '@/models/Post';
import mongoose from 'mongoose';
import { z } from 'zod';

const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(1000).trim(),
});

// POST /api/posts/:id/comment — add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) return errorResponse('Unauthorized — please log in', 401);

    if (!mongoose.isValidObjectId(params.id))
      return errorResponse('Invalid post ID', 400);

    const post = await Post.findById(params.id);
    if (!post) return errorResponse('Post not found', 404);

    const body = await request.json();
    const { text } = commentSchema.parse(body);

    post.comments.push({
      user: new mongoose.Types.ObjectId(currentUser.userId),
      text,
      createdAt: new Date(),
    } as never);

    await post.save();
    await post.populate('comments.user', 'name');

    const newComment = post.comments[post.comments.length - 1];

    return successResponse(newComment, 'Comment added successfully', 201);
  } catch (error) {
    console.error('[COMMENT ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/posts/:id/comment?commentId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(commentId))
      return errorResponse('Invalid ID', 400);

    const post = await Post.findById(params.id);
    if (!post) return errorResponse('Post not found', 404);

    const comment = post.comments.find(
      (c) => c._id.toString() === commentId
    );
    if (!comment) return errorResponse('Comment not found', 404);

    if (comment.user.toString() !== currentUser.userId)
      return errorResponse('Forbidden', 403);

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    ) as never;

    await post.save();

    return successResponse(null, 'Comment deleted');
  } catch (error) {
    console.error('[DELETE COMMENT ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}
