// app/api/auth/callback/linkedin/route.js
export const dynamic = 'force-dynamic'; 
import { NextResponse } from 'next/server';
import { authorizeUser } from '@/lib/fetchUtil';
import { link } from 'fs';

export async function GET(request) {
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/signin?error=no_code', request.url));
    }

    // 1.Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    // console.log(tokenData)

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/signin?error=token_error', request.url));
    }

    // 2.Get user info from LinkedIn
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const linkedinUser = await userResponse.json();

    // 3. Create OAuth token from backend
    const jwtTokenRes = await fetch(`${process.env.API_URL}/api/auth/create-oauth-token?_${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: linkedinUser.name,
        email: linkedinUser.email,
        provider: 'linkedin',
      }),
    });
    const jwtTokenData = await jwtTokenRes.json();
    
    if (!jwtTokenRes.ok || !jwtTokenData.token) {
      console.error('Failed to generate OAuth token');
      return NextResponse.redirect(new URL('/signin', baseUrl));
    }

    // 4. Redirect with token and preserve original redirect destination
    const redirectUrl = new URL(`${baseUrl}/auth/callback/handler`);
    redirectUrl.searchParams.set('name', linkedinUser.name);
    redirectUrl.searchParams.set('email', linkedinUser.email);
    redirectUrl.searchParams.set('token', jwtTokenData.token);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }
}