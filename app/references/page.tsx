import Link from 'next/link';
import CatalogBrowser from '@/components/catalog/catalog-browser';
export default function ReferencesPage() {
  return <main className="min-h-screen bg-[#07110d] px-4 py-6 text-white sm:px-6"><div className="mx-auto max-w-5xl"><header className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold tracking-widest text-emerald-300">ECOBOARD</p><h1 className="mt-2 text-2xl font-semibold">Referências de placas</h1></div><Link href="/analysis" className="rounded-xl border border-emerald-400/30 px-4 py-3 text-emerald-200">Ir para análise</Link></header><CatalogBrowser /></div></main>;
}

