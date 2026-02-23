import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/validators/auth.validator';
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

    const validatedData = loginSchema.parse(body);

    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully',
        data: {
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
          },
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    if (error instanceof ZodError) {
      const fields = error.flatten().fieldErrors;
      const firstMsg = Object.values(fields).flat()[0];
      return NextResponse.json(
        { success: false, message: firstMsg ?? 'Validation failed' },
        { status: 422 }
      );
    }

    console.error('[LOGIN ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
