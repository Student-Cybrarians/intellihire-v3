import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSessionToken } from '@/lib/session'

const VALID_ROLES = ['candidate', 'recruiter', 'admin'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

export async function POST(request: NextRequest) {
  try {
    const { role, email, name } = await request.json()

    // Validate role
    if (!role || !VALID_ROLES.includes(role as ValidRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Create a user object (in real app, fetch from DB)
    const user = {
      id: `usr_${Date.now()}`,
      name: name || (role === 'candidate' ? 'Candidate User' : role === 'recruiter' ? 'Recruiter Lead' : 'Platform Admin'),
      email: email || `${role}@demo.intellihire.ai`,
      role: role as ValidRole,
      tenantId: 'tenant_enterprise_demo',
      avatar: (name || role).slice(0, 2).toUpperCase(),
    }

    // Create session token
    const token = createSessionToken(user)

    // Determine redirect based on role
    let redirectTo = '/dashboard'
    if (role === 'recruiter') redirectTo = '/recruiter/dashboard'
    else if (role === 'admin') redirectTo = '/admin/dashboard'

    // Create response with cookie and redirect
    const response = NextResponse.redirect(new URL(redirectTo, request.url))
    response.cookies.set('intellihire_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}