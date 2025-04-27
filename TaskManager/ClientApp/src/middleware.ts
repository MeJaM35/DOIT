import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/boards',
    '/boards/',
    '/profile',
    '/settings',
  ];
  
  // Check if the current path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Skip middleware on non-protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get auth token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  
  // If there's no token and this is a protected route, redirect to login
  if (!authToken && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Configure matcher to run middleware only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};