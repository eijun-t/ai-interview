import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
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

  // デモページは認証不要
  if (req.nextUrl.pathname.startsWith('/demo')) {
    return response
  }

  if (!user && req.nextUrl.pathname.startsWith('/interview')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (user && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/interview', req.url))
  }

  return response
}

export const config = {
  matcher: ['/interview/:path*', '/auth/:path*', '/demo/:path*'],
}