import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    const isAuthPage = pathname.startsWith('/auth') || 
                       pathname === '/login' || 
                       pathname === '/signup';

    if (isAuthPage) {
      if (isAuth) {
        const isAdmin = token.role === 'ADMIN' || (token.email as string)?.includes('admin') || token.email === 'john@1234';
        return NextResponse.redirect(new URL(isAdmin ? '/admin/dashboard' : '/student/dashboard', req.url));
      }
      
      // If not authenticated, redirect to / with query parameters
      const isRegister = pathname.includes('register') || pathname === '/signup';
      return NextResponse.redirect(new URL(isRegister ? '/?register=true' : '/?login=true', req.url));
    }

    const isDashboardPage = pathname.startsWith('/dashboard') || 
                            pathname.startsWith('/admin/dashboard') || 
                            pathname.startsWith('/student/dashboard');

    if (isDashboardPage && !isAuth) {
      return NextResponse.redirect(new URL('/?login=true', req.url));
    }
  },
  {
    callbacks: {
      authorized: () => {
        // Return true to allow the middleware function to run and handle custom redirection
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/dashboard/:path*', 
    '/student/dashboard/:path*',
    '/auth/:path*',
    '/login',
    '/signup'
  ],
};
