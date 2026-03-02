// app/api/auth/google/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirectParam = searchParams.get('redirect');
  
  // Use OAuth state parameter to preserve redirect destination
  const state = redirectParam ? encodeURIComponent(redirectParam) : '';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile&state=${state}`;

  return NextResponse.redirect(googleAuthUrl);
}