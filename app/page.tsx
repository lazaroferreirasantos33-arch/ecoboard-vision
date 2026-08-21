import Link from 'next/link';

const capabilities = [
  {
    number: '01',
    title: 'Classificação visual',
    description:
      'Identificação assistida por IA do tipo e da categoria da placa eletrônica a partir das imagens da frente e do verso.',
  },
  {
    number: '02',
    title: 'Identificação técnica',
    description:
      'Análise de fabricante, modelo, part number, aplicação provável e características técnicas visíveis da PCB.',
  },
  {
    number: '03',
    title: 'Detecção de componentes',
    description:
      'Reconhecimento de BGAs, memórias, contatos dourados, conectores, transformadores e outros componentes relevantes.',
  },
  {
    number: '04',
    title: 'Potencial para reciclagem',
    description:
      'Avaliação do interesse relativo da placa para reciclagem com base em composição visível, integridade e características construtivas.',
  },
];

const metrics = [
  {
    value: 'Visão computacional',
    label: 'Análise visual assistida',
  },
  {
    value: 'JSON estruturado',
    label: 'Dados técnicos padronizados',
  },
  {
    value: 'Análise frente e verso',
    label: 'Leitura conjunta da PCB',
  },
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

            <div>
              <p className="text-sm font-semibold tracking-[0.18em]">
                ECOBOARD
              </p>

              <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-400">
                Inteligência em Reciclagem
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a
              href="#plataforma"
              className="transition hover:text-white"
            >
              Plataforma
            </a>

            <a
              href="#capacidades"
              className="transition hover:text-white"
            >
              Capacidades
            </a>

            <a
              href="#metodologia"
              className="transition hover:text-white"
            >
              Metodologia
            </a>
          </nav>
        </div>
      </header>

      <section
        id="plataforma"
        className="relative overflow-hidden border-b border-white/10"
      >
        <div className="pointer-events-none absolute left-1/2 top-20 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />

        <div className="relative mx-auto flex max-w-7xl justify-center px-6 py-24 lg:px-8 lg:py-32">
          <div className="w-full max-w-5xl text-center">
            <div className="mx-auto mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              Inteligência para reciclagem eletrônica
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Transforme placas eletrônicas em{' '}
              <span className="text-emerald-400">
                decisões comerciais.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
              Classifique PCBs, identifique componentes estratégicos,
              avalie integridade e compreenda o potencial técnico de
              placas eletrônicas para reciclagem com inteligência
              artificial.
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href="/analysis"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300"
              >
                Analisar uma placa

                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mx-auto mt-14 grid max-w-3xl gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
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
                A EcoBoard combina visão computacional,
                classificação técnica e leitura estruturada para
                transformar imagens de placas eletrônicas em dados
                úteis para triagem e reciclagem.
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

      <section
        id="metodologia"
        className="bg-[#07110d]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 sm:p-12">
            <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                  Metodologia
                </p>

                <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Inteligência artificial para identificar. Estrutura
                  técnica para classificar.
                </h2>

                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/45">
                  A EcoBoard analisa imagens da frente e do verso da
                  PCB, identifica sinais visuais relevantes, estrutura
                  os dados técnicos e produz uma leitura orientada à
                  triagem e ao potencial para reciclagem.
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
          <p>© 2026 EcoBoard.</p>

          <p>
            Inteligência em reciclagem e classificação de placas
            eletrônicas.
          </p>
        </div>
      </footer>
    </main>
  );
}