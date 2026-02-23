import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { signupSchema } from '@/validators/auth.validator';
import User from '@/models/User';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = signupSchema.parse(body);

    // Check existing user
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Create JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    // Build response and set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
          },
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    if (error instanceof ZodError) {
      const fields = error.flatten().fieldErrors;
      const firstMsg = Object.values(fields).flat()[0];
      return NextResponse.json(
        { success: false, message: firstMsg ?? 'Validation failed', errors: fields },
        { status: 422 }
      );
    }

    console.error('[SIGNUP ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
