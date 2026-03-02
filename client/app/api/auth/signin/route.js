// app/api/auth/signin/route.js
import { NextResponse } from 'next/server';
import { findUser, signIn } from '@/lib/fetchUtil';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await findUser(email);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Sign in user
    const user = await signIn(email, password);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: user?.detail || 'Invalid credentials' },
        { status: 401 }
      );
    }
    // Return user data without the token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        status: user.status || 'existing',
        onboarding_details: user.onboarding_details,
        provider: 'credentials',
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}