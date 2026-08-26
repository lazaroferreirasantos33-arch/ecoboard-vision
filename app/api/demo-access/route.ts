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
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const expectedCode =
        process.env.DEMO_ACCESS_CODE;
  
      if (!expectedCode) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Código da demo não configurado.',
          },
          {
            status: 500,
          },
        );
      }
  
      const body = await request.json();
  
      const code =
        typeof body?.code === 'string'
          ? body.code.trim()
          : '';
  
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Informe o código de acesso.',
          },
          {
            status: 400,
          },
        );
      }
  
      if (code !== expectedCode) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Código de acesso inválido.',
          },
          {
            status: 401,
          },
        );
      }
  
      const accessToken =
        await hashValue(expectedCode);
  
      const response =
        NextResponse.json({
          success: true,
        });
  
      response.cookies.set(
        COOKIE_NAME,
        accessToken,
        {
          httpOnly: true,
          sameSite: 'lax',
          secure:
            process.env.NODE_ENV ===
            'production',
          path: '/',
          maxAge:
            60 * 60 * 24 * 7,
        },
      );
  
      return response;
    } catch (error) {
      console.error(
        'ECOBOARD_DEMO_ACCESS_ERROR:',
        error,
      );
  
      return NextResponse.json(
        {
          success: false,
          error:
            'Não foi possível validar o acesso.',
        },
        {
          status: 500,
        },
      );
    }
  }