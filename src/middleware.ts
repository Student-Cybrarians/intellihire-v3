import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/session'

// This function can be marked as `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication (for both HTML and API)
  const publicPaths = ['/login', '/register', '/api/intelligence', '/api/auth/login']

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get('intellihire_session')?.value

  // If no session cookie, handle based on whether it's an API route or not
  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      // For API routes, return 401 Unauthorized
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      // For HTML pages, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Verify the session cookie
  const session = verifySessionToken(sessionCookie)
  if (!session) {
    // Invalid session
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('intellihire_session')
      return response
    }
  }

  // Role-based access control for HTML pages
  // We only apply role-based restrictions to HTML pages, not API routes (unless the API route itself wants to check)
  if (!pathname.startsWith('/api/')) {
    // Admin routes
    if (pathname.startsWith('/admin') && session.role !== 'admin') {
      // Redirect to appropriate dashboard based on role
      const url = request.nextUrl.clone()
      if (session.role === 'recruiter') {
        url.pathname = '/recruiter/dashboard'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Recruiter routes (optional: restrict certain recruiter-only areas)
    // if (pathname.startsWith('/recruiter') && session.role !== 'recruiter') {
    //   // Redirect to appropriate dashboard
    //   const url = request.nextUrl.clone()
    //   if (session.role === 'admin') {
    //     url.pathname = '/admin/dashboard'
    //   } else {
    //     url.pathname = '/dashboard'
    //   }
    //   return NextResponse.redirect(url)
    // }
  }

  // If session exists and user is authorized, continue
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/intelligence (already has its own protection)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     */
    '/((?!api/intelligence|_next/static|_next/image|favicon.ico).*)',
  ],
}