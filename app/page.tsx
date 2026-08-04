import Link from 'next/link';

const capabilities = [
  {
    number: '01',
    title: 'Classificação visual',
    description:
      'Identificação assistida por IA do tipo, categoria e grau comercial da placa eletrônica.',
  },
  {
    number: '02',
    title: 'Detecção de componentes',
    description:
      'Reconhecimento de BGAs, contatos dourados, dissipadores, transformadores e outros componentes relevantes.',
  },
  {
    number: '03',
    title: 'Avaliação de integridade',
    description:
      'Análise visual de oxidação, danos térmicos, canibalização e estado geral da PCB.',
  },
  {
    number: '04',
    title: 'Valoração estimada',
    description:
      'Faixa comercial calculada por categoria, peso, condição, composição provável e referência de mercado.',
  },
];

const metrics = [
  { value: 'Visão computacional', label: 'Análise visual assistida' },
  { value: 'JSON estruturado', label: 'Dados padronizados' },
  { value: 'Motor próprio', label: 'Regras de valoração' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07110d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M8 3v4M16 3v4M8 17v4M16 17v4M3 8h4M17 8h4M3 16h4M17 16h4" />
                <rect x="7" y="7" width="10" height="10" rx="2" />
                <path d="M10 10h4v4h-4z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.18em]">
                ECOBOARD
              </p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">
                Intelligence
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#plataforma" className="transition hover:text-white">
              Plataforma
            </a>
            <a href="#capacidades" className="transition hover:text-white">
              Capacidades
            </a>
            <a href="#metodologia" className="transition hover:text-white">
              Metodologia
            </a>
          </nav>

          <Link
            href="/analysis"
            className="rounded-lg border border-emerald-400/40 bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300"
          >
            Nova análise
          </Link>
        </div>
      </header>

      <section
        id="plataforma"
        className="relative overflow-hidden border-b border-white/10"
      >
        <div className="pointer-events-none absolute left-1/2 top-20 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Inteligência para reciclagem eletrônica
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Transforme placas eletrônicas em{' '}
              <span className="text-emerald-400">decisões comerciais.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
              Classifique PCBs, identifique componentes estratégicos, avalie
              integridade e estime o valor de lotes de sucata eletrônica com
              inteligência artificial e regras técnicas.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/analysis"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300"
              >
                Analisar uma placa
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#capacidades"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Conhecer a plataforma
              </a>
            </div>

            <div className="mt-14 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.value}>
                  <p className="text-sm font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="rounded-[22px] border border-white/10 bg-[#0b1711] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Análise visual
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      PCB-2026-0001
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Processada
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="relative min-h-72 overflow-hidden rounded-2xl border border-white/10 bg-[#10221a]">
                    <div className="absolute inset-5 rounded-xl border border-emerald-400/20 bg-[linear-gradient(90deg,rgba(52,211,153,0.08)_1px,transparent_1px),linear-gradient(rgba(52,211,153,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />

                    <div className="absolute left-[18%] top-[22%] h-16 w-20 rounded border border-emerald-300/70" />
                    <div className="absolute right-[20%] top-[28%] h-12 w-14 rounded border border-cyan-300/60" />
                    <div className="absolute bottom-[24%] left-[30%] h-10 w-24 rounded border border-amber-300/60" />

                    <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/55 backdrop-blur">
                      Component detection
                    </div>
                  </div>

                  <div className="space-y-3">
                    <AnalysisItem
                      label="Categoria"
                      value="Motherboard"
                      accent
                    />
                    <AnalysisItem
                      label="Grau"
                      value="Medium grade"
                    />
                    <AnalysisItem
                      label="Integridade"
                      value="89%"
                    />
                    <AnalysisItem
                      label="Confiança"
                      value="86%"
                    />

                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">
                        Valor estimado
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        R$ 38,00
                      </p>
                      <p className="mt-1 text-xs text-white/35">por kg</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <MiniMetric label="BGAs" value="03" />
                  <MiniMetric label="Gold fingers" value="02" />
                  <MiniMetric label="Dissipadores" value="02" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="capacidades"
        className="border-b border-white/10 bg-[#09150f]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Capacidades
              </p>

              <h2 className="mt-5 max-w-lg text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Uma camada inteligente para a triagem de PCBs.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/45">
                A EcoBoard combina visão computacional, classificação técnica e
                inteligência comercial para transformar imagens em dados
                estruturados e auditáveis.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <article
                  key={capability.number}
                  className="bg-[#0b1811] p-7 transition hover:bg-[#0e1d15]"
                >
                  <p className="text-xs font-medium text-emerald-400">
                    {capability.number}
                  </p>

                  <h3 className="mt-8 text-xl font-semibold">
                    {capability.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/45">
                    {capability.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="metodologia" className="bg-[#07110d]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 sm:p-12">
            <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                  Metodologia
                </p>

                <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Inteligência artificial onde ela agrega. Regras técnicas onde
                  a precisão importa.
                </h2>

                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/45">
                  A imagem orienta a identificação visual. O motor de valoração
                  aplica critérios comerciais próprios, como categoria, peso,
                  integridade, densidade de componentes e referência de mercado.
                </p>
              </div>

              <Link
                href="/analysis"
                className="inline-flex min-w-44 items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-100"
              >
                Iniciar análise
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 EcoBoard Intelligence.</p>
          <p>Classificação e valoração assistida de placas eletrônicas.</p>
        </div>
      </footer>
    </main>
  );
}

function AnalysisItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          accent ? 'text-emerald-300' : 'text-white/80'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/30">
        {label}
      </p>
    </div>
  );
}