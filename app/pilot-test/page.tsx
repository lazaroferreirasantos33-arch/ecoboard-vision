'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  getSupabaseClient,
} from '@/src/lib/supabase';

export default function PilotTestPage() {
  const [status, setStatus] =
    useState('Testando conexão...');

  useEffect(() => {
    let active = true;

    async function testConnection() {
      try {
        const supabase =
          getSupabaseClient();

        const query = supabase
          .from('analysis_feedback')
          .select('id')
          .limit(1);

        const timeout =
          new Promise<never>(
            (_, reject) => {
              setTimeout(() => {
                reject(
                  new Error(
                    'TIMEOUT: o Supabase não respondeu em 10 segundos.',
                  ),
                );
              }, 10000);
            },
          );

        const result =
          await Promise.race([
            query,
            timeout,
          ]);

        if (!active) {
          return;
        }

        if (result.error) {
          setStatus(
            `Supabase respondeu: ${result.error.message}`,
          );

          return;
        }

        setStatus(
          'Conexão do navegador com o Supabase funcionando.',
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus(
          error instanceof Error
            ? `Falha: ${error.message}`
            : 'Falha desconhecida.',
        );
      }
    }

    testConnection();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07110d] px-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          EcoBoard Pilot
        </p>

        <h1 className="mt-4 text-2xl font-semibold">
          Teste de conexão
        </h1>

        <p className="mt-5 text-sm leading-7 text-white/60">
          {status}
        </p>
      </div>
    </main>
  );
}