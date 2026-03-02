export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(request) {
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      console.error('OAuth callback error: No authorization code');
      return NextResponse.redirect(new URL('/signin', baseUrl));
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/signin', baseUrl));
    }

    // 2. Fetch user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();
    if (!userResponse.ok || !googleUser.email) {
      console.error('Failed to fetch Google user info');
      return NextResponse.redirect(new URL('/signin', baseUrl));
    }

    // 3. Create OAuth token from backend
    const jwtTokenRes = await fetch(`${process.env.API_URL}/api/auth/create-oauth-token?_${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: googleUser.name,
        email: googleUser.email,
        provider: 'google',
      }),
    });

    const jwtTokenData = await jwtTokenRes.json();
    
    if (!jwtTokenRes.ok || !jwtTokenData.token) {
      console.error('Failed to generate OAuth token');
      return NextResponse.redirect(new URL('/signin', baseUrl));
    }

    // 4. Redirect with token and preserve original redirect destination
    const redirectUrl = new URL(`${baseUrl}/auth/callback/handler`);
    redirectUrl.searchParams.set('name', googleUser.name);
    redirectUrl.searchParams.set('email', googleUser.email);
    redirectUrl.searchParams.set('token', jwtTokenData.token);

    return NextResponse.redirect(redirectUrl);

  } catch (err) {
    console.error('OAuth handler error:', err);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}
