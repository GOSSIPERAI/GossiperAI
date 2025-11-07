import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { SecurityHeaders } from '@/lib/auth-security'

export async function middleware(request: NextRequest) {
  // 🚦 Skip auth for AssemblyAI callbacks
  if (request.nextUrl.pathname.startsWith('/api/transcription/callback')) {
    console.log('🪶 [MIDDLEWARE] Bypassing auth for webhook')
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // 🧠 Attach Supabase with proper cookie management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: CookieOptions) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getUser()
  const user = data?.user ?? null

  // 🧩 Define public routes
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/callback',
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
  const path = request.nextUrl.pathname
  const isPublic = publicRoutes.some(route => path.startsWith(route))

  // 🔒 Auth Redirect Logic
  if (!user && !isPublic && !path.startsWith('/api')) {
    console.log(`🛡️ Redirecting unauthenticated request: ${path}`)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // 🚫 Prevent authenticated users from revisiting login/signup
  if (
    user &&
    request.method === 'GET' &&
    (path.startsWith('/login') || path.startsWith('/signup'))
  ) {
    const role = (user.user_metadata?.role as 'student' | 'lecturer' | 'admin') || 'student'
    const redirect =
      role === 'lecturer'
        ? '/dashboard?role=lecturer'
        : role === 'admin'
        ? '/dashboard?role=admin'
        : '/dashboard?role=student'

    return NextResponse.redirect(new URL(redirect, request.url))
  }

  // 👮 Role-based route guard
  /*if (user && path.startsWith('/create-session')) {
    const role = user.user_metadata?.role || 'student'
    if (role !== 'lecturer' && role !== 'admin') {
      console.log(`🛑 Unauthorized attempt by ${user.id.slice(0, 6)}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }*/

  // 🧾 Attach user info headers for API routes
  if (user && path.startsWith('/api')) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', user.user_metadata?.role || 'student')
  }

  // 🛡️ Add final security headers
  Object.entries(SecurityHeaders.getSecurityHeaders()).forEach(([k, v]) =>
    response.headers.set(k, v)
  )

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
