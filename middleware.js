// MIDDLEWARE TEMPORARILY DISABLED FOR DEBUGGING
// The middleware was causing severe performance issues during login/signup
// TODO: Re-implement with a simpler approach after identifying the root cause

import { NextResponse } from 'next/server'

export async function middleware(request) {
    // Pass through all requests without any auth checks
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
