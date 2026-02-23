import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createPostSchema } from '@/validators/post.validator';
import { generateSlug, generateUniqueSlug } from '@/lib/utils';
import Post from '@/models/Post';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'));
    const search = searchParams.get('search')?.trim() ?? '';
    const authorId = searchParams.get('author') ?? '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (search) query.$text = { $search: search };
    if (authorId) query.author = authorId;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse(posts, 'Posts fetched successfully', 200, {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error('[GET POSTS ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse('Unauthorized — please log in', 401);
    }

    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    let slug = generateSlug(validatedData.title);
    const existing = await Post.findOne({ slug });
    if (existing) {
      slug = generateUniqueSlug(validatedData.title);
    }

    const post = await Post.create({
      ...validatedData,
      slug,
      author: currentUser.userId,
    });

    await post.populate('author', 'name email');

    return successResponse(post.toJSON(), 'Post created successfully', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.flatten().fieldErrors as Record<string, string[]>;
      return errorResponse('Validation failed', 422, errors);
    }
    console.error('[CREATE POST ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}
