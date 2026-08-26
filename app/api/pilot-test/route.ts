import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('analysis_feedback')
      .select('id')
      .limit(1);

    if (error) {
      console.error(
        'ECOBOARD_SUPABASE_TEST_ERROR:',
        error,
      );

      return NextResponse.json(
        {
          ok: false,
          stage: 'supabase-query',
          error: error.message,
          details: error.details ?? null,
          hint: error.hint ?? null,
          code: error.code ?? null,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        'Conexão com o Supabase da EcoBoard funcionando.',
      rowsFound: data?.length ?? 0,
    });
  } catch (error) {
    console.error(
      'ECOBOARD_SUPABASE_TEST_EXCEPTION:',
      error,
    );

    const cause =
      error instanceof Error
        ? (
            error as Error & {
              cause?: {
                code?: string;
                errno?: number;
                syscall?: string;
                address?: string;
                message?: string;
              };
            }
          ).cause
        : undefined;

    return NextResponse.json(
      {
        ok: false,
        stage: 'network',
        error:
          error instanceof Error
            ? error.message
            : String(error),
        cause: cause
          ? {
              code: cause.code ?? null,
              errno: cause.errno ?? null,
              syscall: cause.syscall ?? null,
              address: cause.address ?? null,
              message: cause.message ?? null,
            }
          : null,
      },
      {
        status: 500,
      },
    );
  }
}