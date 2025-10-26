import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { SecurityHeaders } from '@/lib/auth-security'

export async function middleware(request: NextRequest) {
  // 🚦 Allow unauthenticated AssemblyAI webhook calls to pass through immediately
if (request.nextUrl.pathname.startsWith('/api/transcription/callback')) {
  console.log('🪶 [MIDDLEWARE] Bypassing auth for AssemblyAI webhook')
  return NextResponse.next()
}

  // Proceed with normal middleware logic
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Add security headers
  const securityHeaders = SecurityHeaders.getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('🛡️ [MIDDLEWARE] Checking auth for:', request.nextUrl.pathname)
  console.log('🛡️ [MIDDLEWARE] User authenticated:', !!user)

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup', 
    '/forgot-password',
    '/auth/callback', //added this
    '/auth',
    '/api',
    '/api/transcription/callback', // AssemblyAI webhook endpoint
    '/',
    '/features',
    '/pricing',
    '/about',
    '/help',
    '/contact',
    '/privacy',
    '/terms'
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  /* If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    const role = (user.user_metadata?.role as 'student' | 'lecturer' | 'admin') || 'student'
    const redirect = role === 'lecturer' ? '/dashboard?role=lecturer' : role === 'admin' ? '/dashboard?role=admin' : '/dashboard?role=student'
    return NextResponse.redirect(new URL(redirect, request.url))
  }*/

    // If user is authenticated and trying to access auth pages, redirect to dashboard
// BUT: Don't redirect if it's a POST request (form submission in progress)
if (user && 
    (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) &&
    request.method === 'GET') {
  const role = (user.user_metadata?.role as 'student' | 'lecturer' | 'admin') || 'student'
  const redirect = role === 'lecturer' ? '/dashboard?role=lecturer' : role === 'admin' ? '/dashboard?role=admin' : '/dashboard?role=student'
  return NextResponse.redirect(new URL(redirect, request.url))
}


  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    console.log('🛡️ [MIDDLEWARE] No user found, redirecting to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated, add user info to headers for API routes
  if (user && request.nextUrl.pathname.startsWith('/api')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email || '')
    requestHeaders.set('x-user-role', user.user_metadata?.role || 'student')
    
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Role-based access control for specific routes
  if (user && request.nextUrl.pathname.startsWith('/create-session')) {
    const userRole = user.user_metadata?.role || 'student'
    if (userRole !== 'lecturer' && userRole !== 'admin') {
      console.log('🛡️ [MIDDLEWARE] Insufficient permissions for create-session')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
