import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to avoid any conflicts with authentication
  // Let client-side ProtectedLayout handle all authentication checks
  
  // Avoid using nextUrl.pathname in Edge Runtime to prevent Node.js url module usage
  const pathname = new URL(request.url).pathname
  console.log('Middleware called for:', pathname)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}