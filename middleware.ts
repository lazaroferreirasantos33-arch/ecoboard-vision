import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  const COOKIE_NAME =
    'ecoboard_demo_access';
  
  async function hashValue(
    value: string,
  ): Promise<string> {
    const data =
      new TextEncoder().encode(value);
  
    const digest =
      await crypto.subtle.digest(
        'SHA-256',
        data,
      );
  
    return Array.from(
      new Uint8Array(digest),
    )
      .map((byte) =>
        byte.toString(16).padStart(2, '0'),
      )
      .join('');
  }
  
  export async function middleware(
    request: NextRequest,
  ) {
    const expectedCode =
      process.env.DEMO_ACCESS_CODE;
  
    if (!expectedCode) {
      return NextResponse.next();
    }
  
    const expectedToken =
      await hashValue(expectedCode);
  
    const currentToken =
      request.cookies.get(
        COOKIE_NAME,
      )?.value;
  
    if (
      currentToken === expectedToken
    ) {
      return NextResponse.next();
    }
  
    if (
      request.nextUrl.pathname.startsWith(
        '/api/',
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Acesso à demo não autorizado.',
        },
        {
          status: 401,
        },
      );
    }
  
    const url =
      request.nextUrl.clone();
  
    url.pathname = '/demo-access';
  
    return NextResponse.redirect(url);
  }
  
  export const config = {
    matcher: [
      '/analysis/:path*',
      '/api/analyze/:path*',
    ],
  };