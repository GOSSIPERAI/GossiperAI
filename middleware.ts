import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 🚦 Skip auth for AssemblyAI callbacks or other webhooks if needed
  if (request.nextUrl.pathname.startsWith('/api/transcription/callback')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  const isAuth = !!token;
  const path = request.nextUrl.pathname;

  // 🧩 Define public routes
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/error',
    '/',
    '/api/register',
    '/api/auth', // Important for NextAuth routes
    '/features',
    '/pricing',
    '/about',
    '/help',
    '/contact',
    '/privacy',
    '/terms'
  ];

  // Check if route is public
  const isPublic = publicRoutes.some(route => path.startsWith(route));

  // 🔒 Auth Redirect Logic
  if (!isAuth && !isPublic) {
    console.log(`🛡️ Redirecting unauthenticated request: ${path}`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 🚫 Prevent authenticated users from revisiting login/signup
  if (
    isAuth &&
    (path.startsWith('/login') || path.startsWith('/signup'))
  ) {
    const role = (token?.role as string) || 'student';
    // Simple redirection based on role, matching previous logic
    const redirect = role === 'student' ? '/dashboard' : '/dashboard'; // Simplify to dashboard for now as query params might not be needed

    // If strict role logic was needed:
    // const redirect = role === 'lecturer' ? '/dashboard?role=lecturer' ...

    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 👮 Role-based route guard
  if (isAuth && path.startsWith('/create-session')) {
    const role = (token?.role as string) || 'student';
    if (role !== 'lecturer' && role !== 'admin') {
      console.log(`🛑 Unauthorized attempt by ${token?.email}`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 🧾 Attach user info headers for API routes (optional, mainly for legacy compatibility)
  if (isAuth && path.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('x-user-id', token.id as string);
    response.headers.set('x-user-role', (token.role as string) || 'student');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
