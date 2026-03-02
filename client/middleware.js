import { NextResponse } from 'next/server';
import { getOnboardingDetailsUsingToken } from './lib/onBoardUtil';
import { getCurrentUser } from './lib/fetchUtil';

const protectedRoutes = ['/dashboard', '/resumes', '/profile', '/ai-interviewer', '/ai-learning-guide', '/skill-gap-analysis', '/checkout'];
const authRoutes = ['/signin', '/create-account'];
const onboardingRoute = '/onboard';
const allowedSubdomains = ['app.vokely.io', 'app.staging.vokely.io'];

export async function middleware(request) {
  const token = request.cookies.get('access_token')?.value;
  const hostname = request.headers.get('host');
  const origin = request.nextUrl.origin;
  const protocol = hostname.includes('localhost') ? 'http' : 'https';
  const { pathname } = request.nextUrl;

  const isOnboardRoute = pathname.startsWith(onboardingRoute);
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  let response = NextResponse.next();

  // // 1. Redirect unauthenticated users
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/signin', process.env.NEXT_PUBLIC_CURRENT_URL));
  }
  
  //Check if user is accessing via any other subdomains instead of app.
  if (isProtectedRoute && !allowedSubdomains.includes(hostname) && protocol==="https") {
    return NextResponse.redirect(new URL('/not-found', process.env.NEXT_PUBLIC_CURRENT_URL));
  }else if(isAuthRoute && allowedSubdomains.includes(hostname) && protocol==="https"){
    return NextResponse.redirect(new URL('/signin', process.env.NEXT_PUBLIC_CURRENT_URL));
  }

  // 2. Prevent authenticated users from seeing signin/signup
  if (isAuthRoute && token) {
    const res = await getCurrentUser(token);
    if (res.ok) {
      // Check for redirect parameter and honor it for authenticated users
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (redirectParam) {
        const redirectUrl = decodeURIComponent(redirectParam);
        // Validate the redirect URL is internal
        if (redirectUrl.startsWith('/')) {
          return NextResponse.redirect(`${origin}${redirectUrl}`);
        }
      }
      
      // Default redirect to dashboard if no valid redirect parameter
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 3. Onboarding status check
  if (!isOnboardRoute && isProtectedRoute) {
    try {
      const onboardingRes = await getOnboardingDetailsUsingToken(token);
      if (!onboardingRes.ok){
        console.error('Error fetching details STATUS:',onboardingRes.status);
        return;
      };

      const data = await onboardingRes.json();
      if (data?.status !== 'completed') {
        return NextResponse.redirect(`${origin}/onboard`);
      }
    } catch (error) {
      console.error("Onboarding check failed:", error);
      return response;
    }
  }

  // 4. Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  response.headers.set('X-XSS-Protection', '1; mode=block'); 

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
