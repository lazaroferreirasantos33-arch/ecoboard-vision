'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

export default function DemoAccessPage() {
  const router = useRouter();

  const [code, setCode] =
    useState('');

  const [error, setError] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!code.trim()) {
      setError(
        'Informe o código de acesso.',
      );
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        '/api/demo-access',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            code: code.trim(),
          }),
        },
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            'Código de acesso inválido.',
        );
      }

      router.replace('/analysis');
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível validar o acesso.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07110d] px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M8 3v4M16 3v4M8 17v4M16 17v4M3 8h4M17 8h4M3 16h4M17 16h4" />
              <rect
                x="7"
                y="7"
                width="10"
                height="10"
                rx="2"
              />
              <path d="M10 10h4v4h-4z" />
            </svg>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            EcoBoard Pilot
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
            Acesso à demonstração
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/45">
            Informe o código fornecido pela EcoBoard para acessar o
            piloto de campo.
          </p>
        </div>

        <form
          className="mt-7 grid gap-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="demo-code"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40"
            >
              Código de acesso
            </label>

            <input
              id="demo-code"
              type="password"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
              autoComplete="off"
              autoFocus
              placeholder="Digite o código"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !code.trim()
            }
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Validando...'
              : 'Acessar EcoBoard'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-white/25">
          Ambiente reservado para validação técnica e comercial.
        </p>
      </section>
    </main>
  );
}