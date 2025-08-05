import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_request: NextRequest) {
  // Temporarily disable middleware to avoid any conflicts with authentication
  // Let client-side ProtectedLayout handle all authentication checks
  
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}