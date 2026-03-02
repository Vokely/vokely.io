// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import { findUser, signUp } from '@/lib/fetchUtil';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUser(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await signUp(name, email, password);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: user?.detail || 'Signup failed' },
        { status: 400 }
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
        status: user.status || 'new',
        onboarding_details: user.onboarding_details,
        provider: 'credentials',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}