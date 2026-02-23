import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);

    if (!mongoose.isValidObjectId(params.id)) {
      return errorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(params.id);
    if (!post) return errorResponse('Post not found', 404);

    const userId = new mongoose.Types.ObjectId(currentUser.userId);
    const alreadyLiked = post.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return successResponse(
      { likes: post.likes.length, liked: !alreadyLiked },
      alreadyLiked ? 'Post unliked' : 'Post liked'
    );
  } catch (error) {
    console.error('[LIKE ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}
