'use client';

import { useState } from 'react';
import { catalogReferences, searchReferences } from '@/src/ecoboard/catalog';

export default function CatalogBrowser() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const results = searchReferences(query, group);
  const detail = catalogReferences.find(item => item.id === selected);
  const groups = Array.from(new Set(catalogReferences.map(item => item.group)));
  return <div className="space-y-6 text-base">
    <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 leading-6 text-amber-100">Referências do catálogo Lorene 2023. Os códigos são da fonte e ainda não foram confirmados como códigos do comprador. Esta consulta não altera o resultado da análise.</p>
    {detail ? <div className="space-y-5">
      <button type="button" onClick={() => setSelected(null)} className="min-h-[44px] rounded-lg border border-emerald-400/30 px-4 text-emerald-200">Voltar aos resultados</button>
      <h2 className="text-2xl font-semibold">{detail.title}</h2>
      <p className="break-words text-emerald-200">{detail.codes.join(' · ') || 'Regras gerais'}</p>
      {detail.historicalCodes && <p className="text-sm text-white/70">Correspondências históricas candidatas de 2017: {detail.historicalCodes.join(', ')}. Reconferência pendente.</p>}
      {detail.notes.length > 0 && <ul className="list-disc space-y-2 pl-5 text-white/85">{detail.notes.map(note => <li key={note}>{note}</li>)}</ul>}
      <p className="text-sm text-white/70">As fotografias abaixo são exemplos do catálogo, não fotos da sua placa. A página completa preserva a relação entre imagens e legendas.</p>
      {detail.pages.map(page => <figure key={page} className="overflow-hidden rounded-xl border border-white/20">
        <figcaption className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-4 text-sm"><span>Lorene 2023 · página {page}</span><a href={`/catalog-assets/${page}.webp`} target="_blank" rel="noreferrer" className="min-h-[44px] content-center text-emerald-200 underline">Ampliar imagem em outra aba</a></figcaption>
        {/* Original catalog page: no AI-generated replacement or inferred photo pairing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/catalog-assets/${page}.webp`} alt={`Página ${page} do catálogo Lorene 2023: ${detail.title}. Fotografias e legendas originais.`} loading="lazy" className="h-auto w-full bg-white" />
      </figure>)}
    </div> : <>
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <label className="space-y-2"><span className="block">Buscar referência</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: celular, PVE0016, ponteira" className="min-h-[48px] w-full rounded-xl border border-white/25 bg-[#10251b] px-4 text-base focus:outline-emerald-300" /></label>
        <label className="space-y-2"><span className="block">Tipo de material</span><select value={group} onChange={e => setGroup(e.target.value)} className="min-h-[48px] w-full rounded-xl border border-white/25 bg-[#10251b] px-3 text-base"><option value="">Todos</option>{groups.map(g => <option key={g}>{g}</option>)}</select></label>
      </div>
      <p role="status" className="text-sm text-white/70">{results.length} referências encontradas</p>
      {!results.length && <div className="rounded-xl border border-white/15 p-6"><p>Nenhuma referência encontrada. Tente outro código ou uma descrição mais curta.</p><button type="button" onClick={() => {setQuery('');setGroup('');}} className="mt-3 min-h-[44px] text-emerald-200 underline">Limpar busca</button></div>}
      <div className="grid gap-4 sm:grid-cols-2">{results.map(item => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className="rounded-2xl border border-white/15 bg-white/[0.035] p-5 text-left transition hover:border-emerald-300/50 focus-visible:outline focus-visible:outline-emerald-300">
        <span className="text-sm text-emerald-200">{item.group}</span><h2 className="mt-2 text-lg font-semibold">{item.title}</h2><p className="mt-2 break-words text-sm leading-6 text-white/70">{item.codes.join(' · ') || 'Critérios e exceções'}</p><p className="mt-4 text-sm text-emerald-200">Ver fotos e critérios · p. {item.pages.join(', ')}</p>
      </button>)}</div>
    </>}
  </div>;
}

