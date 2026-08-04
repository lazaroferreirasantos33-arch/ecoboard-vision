import Link from 'next/link';

export default function AnalysisPage() {
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

          <Link
            href="/"
            className="text-sm text-white/50 transition hover:text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Vision AI
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Nova análise de placa
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Envie uma imagem nítida da placa eletrônica. Para melhorar a
            classificação, informe também o peso e a origem do equipamento.
          </p>
        </div>

        <form className="grid gap-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.025] px-6 text-center transition hover:border-emerald-400/60">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M12 16V4" />
                  <path d="m7 9 5-5 5 5" />
                  <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                Envie a fotografia da PCB
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                Arraste a imagem para esta área ou selecione um arquivo do
                dispositivo.
              </p>

              <label className="mt-6 cursor-pointer rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300">
                Selecionar imagem
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </label>

              <p className="mt-4 text-xs text-white/25">
                JPG, PNG ou WEBP. Máximo recomendado: 10 MB.
              </p>
            </div>
          </section>

          <section className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label
                htmlFor="weight"
                className="text-xs font-medium uppercase tracking-[0.16em] text-white/40"
              >
                Peso da placa
              </label>

              <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-emerald-400/50">
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0,000"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20"
                />
                <span className="flex items-center border-l border-white/10 px-4 text-sm text-white/35">
                  kg
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="text-xs font-medium uppercase tracking-[0.16em] text-white/40"
              >
                Quantidade
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                defaultValue="1"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
              />
            </div>

            <div>
              <label
                htmlFor="origin"
                className="text-xs font-medium uppercase tracking-[0.16em] text-white/40"
              >
                Origem do equipamento
              </label>

              <select
                id="origin"
                name="origin"
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1711] px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
              >
                <option value="" disabled>
                  Selecione uma origem
                </option>
                <option value="desktop">Computador desktop</option>
                <option value="laptop">Notebook</option>
                <option value="server">Servidor</option>
                <option value="smartphone">Smartphone</option>
                <option value="telecom">Equipamento de telecom</option>
                <option value="tv">TV ou monitor</option>
                <option value="industrial">Equipamento industrial</option>
                <option value="appliance">Eletrodoméstico</option>
                <option value="unknown">Origem desconhecida</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reference"
                className="text-xs font-medium uppercase tracking-[0.16em] text-white/40"
              >
                Referência ou modelo
              </label>

              <input
                id="reference"
                name="reference"
                type="text"
                placeholder="Ex.: Dell PowerEdge R740"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="text-xs font-medium uppercase tracking-[0.16em] text-white/40"
              >
                Observações
              </label>

              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Informe danos, ausência de componentes, oxidação ou outras características relevantes."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/50"
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-7 py-3.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300"
            >
              Analisar placa
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}