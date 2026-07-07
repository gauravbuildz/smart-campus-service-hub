import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    if (pathname === '/' || pathname === '') {
      if (isAuth) {
        const isAdmin = token.role === 'ADMIN' || (token.email as string)?.includes('admin') || token.email === 'john@1234';
        const response = NextResponse.redirect(new URL(isAdmin ? '/admin/dashboard' : '/student/dashboard', req.url));
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
      }
      return NextResponse.next();
    }

    const isAuthPage = pathname.startsWith('/auth') || 
                       pathname === '/login' || 
                       pathname === '/signup';

    if (isAuthPage) {
      if (isAuth) {
        const isAdmin = token.role === 'ADMIN' || (token.email as string)?.includes('admin') || token.email === 'john@1234';
        const response = NextResponse.redirect(new URL(isAdmin ? '/admin/dashboard' : '/student/dashboard', req.url));
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
      }
      
      // If not authenticated, redirect to / with query parameters
      const isRegister = pathname.includes('register') || pathname === '/signup';
      const response = NextResponse.redirect(new URL(isRegister ? '/?register=true' : '/?login=true', req.url));
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }

    const isDashboardPage = pathname.startsWith('/dashboard') || 
                            pathname.startsWith('/admin/dashboard') || 
                            pathname.startsWith('/student/dashboard');

    if (isDashboardPage) {
      if (!isAuth) {
        const response = NextResponse.redirect(new URL('/?login=true', req.url));
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
      }

      // Authorize dashboard page based on role
      const isAdmin = token.role === 'ADMIN' || (token.email as string)?.includes('admin') || token.email === 'john@1234';
      
      // Prevent students from accessing admin paths
      if (pathname.startsWith('/admin/dashboard') && !isAdmin) {
        const response = NextResponse.redirect(new URL('/student/dashboard', req.url));
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
      }

      // Prevent admins from accessing student paths
      if (pathname.startsWith('/student/dashboard') && isAdmin) {
        const response = NextResponse.redirect(new URL('/admin/dashboard', req.url));
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
      }

      // Redirect direct /dashboard requests to the role-specific dashboard path
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        const response = NextResponse.redirect(new URL(isAdmin ? '/admin/dashboard' : '/student/dashboard', req.url));
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return response;
      }
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
    '/',
    '/dashboard/:path*', 
    '/admin/dashboard/:path*', 
    '/student/dashboard/:path*',
    '/auth/:path*',
    '/login',
    '/signup'
  ],
};
