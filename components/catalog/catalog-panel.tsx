'use client';
import { useRef } from 'react';
import CatalogBrowser from './catalog-browser';
export default function CatalogPanel() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} className="min-h-[44px] rounded-xl border border-emerald-400/30 px-3 py-2 text-sm font-semibold text-emerald-200">Referências de placas</button>
    <dialog ref={dialog} className="m-auto max-h-[94dvh] w-[96vw] max-w-5xl overflow-y-auto rounded-2xl border border-white/20 bg-[#07110d] p-0 text-white backdrop:bg-black/80" aria-labelledby="catalog-dialog-title">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/15 bg-[#07110d] p-4"><h2 id="catalog-dialog-title" className="text-xl font-semibold">Referências de placas</h2><button type="button" autoFocus onClick={() => dialog.current?.close()} className="min-h-[44px] rounded-lg border border-white/30 px-4 text-sm">Fechar consulta</button></div>
      <div className="p-4 sm:p-6"><CatalogBrowser /></div>
    </dialog>
  </>;
}

