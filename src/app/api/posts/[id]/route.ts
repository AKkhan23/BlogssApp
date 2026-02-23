import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updatePostSchema } from '@/validators/post.validator';
import { generateSlug, generateUniqueSlug } from '@/lib/utils';
import Post from '@/models/Post';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    if (!mongoose.isValidObjectId(params.id)) {
      return errorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .lean();

    if (!post) return errorResponse('Post not found', 404);

    return successResponse(post, 'Post fetched successfully');
  } catch (error) {
    console.error('[GET POST ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);

    if (!mongoose.isValidObjectId(params.id)) {
      return errorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(params.id);
    if (!post) return errorResponse('Post not found', 404);

    if (post.author.toString() !== currentUser.userId) {
      return errorResponse('Forbidden — you can only edit your own posts', 403);
    }

    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    const updatePayload: Record<string, unknown> = { ...validatedData };
    if (validatedData.title && validatedData.title !== post.title) {
      let slug = generateSlug(validatedData.title);
      const existing = await Post.findOne({ slug, _id: { $ne: params.id } });
      if (existing) slug = generateUniqueSlug(validatedData.title);
      updatePayload.slug = slug;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).populate('author', 'name email').lean();

    return successResponse(updatedPost, 'Post updated successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors as Record<string, string[]>;
      return errorResponse('Validation failed', 422, errors);
    }
    console.error('[UPDATE POST ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) return errorResponse('Unauthorized', 401);

    if (!mongoose.isValidObjectId(params.id)) {
      return errorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(params.id);
    if (!post) return errorResponse('Post not found', 404);

    if (post.author.toString() !== currentUser.userId) {
      return errorResponse('Forbidden — you can only delete your own posts', 403);
    }

    await post.deleteOne();
    return successResponse(null, 'Post deleted successfully');
  } catch (error) {
    console.error('[DELETE POST ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}
