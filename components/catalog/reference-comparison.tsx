'use client';

import {
  useState,
} from 'react';

type CommercialResult = {
  identification: {
    board_type: string;
    probable_name: string;
  };

  commercial_classification: {
    category: string;
    confidence: number;
    visual_evidence: string[];
    reason: string;
    human_review_required: boolean;
  };
};

type ReferenceSummary = {
  id: string;
  source: string;
  edition: string;
  page: number;
  title: string;
  codes: string[];
};

type ComparisonResponse = {
  success?: boolean;
  error?: string;

  comparison?: {
    testId: string;
    createdAt: string;
    catalogVersion: string;
    selectionVersion: string;
    status:
      | 'completed'
      | 'skipped';
    reason?: string;
    references: ReferenceSummary[];
    data?: CommercialResult;
    elapsedMs: number;

    metadata?: {
      model: string;
      fallbackUsed: boolean;
      elapsedMs: number;
      promptVersion: string;
      schemaVersion: string;

      tokens: {
        input: number | null;
        output: number | null;
        total: number | null;
        cached: number | null;
        thoughts: number | null;
      };
    };
  };
};

type ReferenceComparisonProps = {
  baseline: CommercialResult;
  frontFile: File | null;
  backFile: File | null;
};

function getCurrentFormValue(
  fieldName: string,
): string {
  const element =
    document.querySelector<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >(
      `[name="${fieldName}"]`,
    );

  return element?.value ?? '';
}

function formatConfidence(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return 'não informada';
  }

  return `${Math.round(value * 100)}%`;
}

function formatSeconds(
  milliseconds: number,
): string {
  return `${(
    milliseconds / 1000
  ).toFixed(1)} s`;
}

export default function ReferenceComparison({
  baseline,
  frontFile,
  backFile,
}: ReferenceComparisonProps) {
  const [
    isComparing,
    setIsComparing,
  ] = useState(false);

  const [
    comparison,
    setComparison,
  ] = useState<
    NonNullable<
      ComparisonResponse['comparison']
    > | null
  >(null);

  const [
    error,
    setError,
  ] = useState('');

  async function compareWithReferences() {
    if (!frontFile) {
      setError(
        'A foto analisada não está disponível. Faça uma nova análise.',
      );

      return;
    }

    setError('');
    setComparison(null);
    setIsComparing(true);

    try {
      const formData =
        new FormData();

      formData.set(
        'frontImage',
        frontFile,
      );

      if (backFile) {
        formData.set(
          'backImage',
          backFile,
        );
      }

      formData.set(
        'baseline',
        JSON.stringify(baseline),
      );

      for (
        const fieldName of [
          'weight',
          'quantity',
          'origin',
          'reference',
          'notes',
        ]
      ) {
        formData.set(
          fieldName,
          getCurrentFormValue(
            fieldName,
          ),
        );
      }

      const response =
        await fetch(
          '/api/analyze/reference-test',
          {
            method: 'POST',
            body: formData,
          },
        );

      const responseText =
        await response.text();

      let result:
        ComparisonResponse;

      try {
        result =
          JSON.parse(
            responseText,
          );
      } catch {
        throw new Error(
          'A comparação retornou uma resposta inválida.',
        );
      }

      if (
        !response.ok ||
        !result.success ||
        !result.comparison
      ) {
        throw new Error(
          result.error ||
            'Não foi possível concluir a comparação.',
        );
      }

      setComparison(
        result.comparison,
      );
    } catch (
      comparisonError
    ) {
      setError(
        comparisonError instanceof
          Error
          ? comparisonError.message
          : 'Não foi possível concluir a comparação.',
      );
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.035]">
      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Teste controlado
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          Comparar com referências
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
          Executa uma segunda análise
          somente quando a identificação
          técnica inicial selecionar uma
          referência compatível. O laudo
          atual permanece inalterado.
        </p>

        <button
          type="button"
          onClick={
            compareWithReferences
          }
          disabled={
            isComparing ||
            !frontFile
          }
          className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isComparing
            ? 'Comparando...'
            : 'Comparar com referências'}
        </button>

        {isComparing && (
          <p className="mt-4 text-sm text-white/55">
            A EcoBoard está executando
            uma segunda chamada ao Gemini.
            Isso pode levar mais tempo.
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {comparison?.status ===
          'skipped' && (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.035] p-5">
            <p className="font-semibold">
              Comparação não aplicada
            </p>

            <p className="mt-2 text-sm leading-6 text-white/60">
              {comparison.reason}
            </p>

            <p className="mt-3 text-xs text-white/35">
              Nenhuma chamada adicional
              ao Gemini foi necessária.
            </p>
          </div>
        )}

        {comparison?.status ===
          'completed' &&
          comparison.data && (
          <div className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-white/15 bg-white/[0.035] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                  Análise atual da IA
                </p>

                <p className="mt-3 break-words text-xl font-semibold">
                  {
                    baseline
                      .commercial_classification
                      .category
                  }
                </p>

                <p className="mt-2 text-sm text-white/55">
                  Confiança:{' '}
                  {formatConfidence(
                    baseline
                      .commercial_classification
                      .confidence,
                  )}
                </p>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  {
                    baseline
                      .commercial_classification
                      .reason
                  }
                </p>
              </article>

              <article className="rounded-2xl border border-cyan-300/30 bg-cyan-300/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">
                  IA com referência
                </p>

                <p className="mt-3 break-words text-xl font-semibold">
                  {
                    comparison.data
                      .commercial_classification
                      .category
                  }
                </p>

                <p className="mt-2 text-sm text-white/55">
                  Confiança:{' '}
                  {formatConfidence(
                    comparison.data
                      .commercial_classification
                      .confidence,
                  )}
                </p>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  {
                    comparison.data
                      .commercial_classification
                      .reason
                  }
                </p>
              </article>
            </div>

            <div className="rounded-2xl border border-white/15 p-5">
              <p className="font-semibold">
                Referência enviada
              </p>

              {comparison.references.map(
                (
                  reference,
                ) => (
                  <div
                    key={
                      reference.id
                    }
                    className="mt-3 text-sm leading-6 text-white/65"
                  >
                    <p>
                      {
                        reference.title
                      }{' '}
                      — página{' '}
                      {
                        reference.page
                      }
                    </p>

                    <p>
                      Código da fonte:{' '}
                      {
                        reference.codes.join(
                          ', ',
                        )
                      }
                    </p>
                  </div>
                ),
              )}

              <div className="mt-4 grid gap-2 text-xs text-white/40 sm:grid-cols-2">
                <p>
                  Tempo total:{' '}
                  {formatSeconds(
                    comparison.elapsedMs,
                  )}
                </p>

                <p>
                  Modelo:{' '}
                  {
                    comparison.metadata
                      ?.model ??
                    'não informado'
                  }
                </p>

                <p>
                  Tokens totais:{' '}
                  {
                    comparison.metadata
                      ?.tokens.total ??
                    'não informado'
                  }
                </p>

                <p>
                  Revisão humana:{' '}
                  {comparison.data
                    .commercial_classification
                    .human_review_required
                    ? 'necessária'
                    : 'não solicitada pela IA'}
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-amber-200/75">
                Estes dois campos mostram
                a resposta comercial da IA
                antes da aplicação do motor
                V2 da interface. O resultado
                operacional atual não foi
                substituído.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}