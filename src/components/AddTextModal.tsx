'use client'

import { Fragment, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Dialog, Transition } from '@headlessui/react'

interface AddTextModalProps {
  isOpen: boolean
  onClose: (newText?: any) => void
  memorialId: string | number
  editingText?: any | null; // Zmieniamy editingQuote na editingText
}

export default function AddTextModal({ isOpen, onClose, memorialId, editingText }: AddTextModalProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  // Ustawiamy dane do edycji, jeśli istnieją
  useEffect(() => {
    if (editingText) {
      setTitle(editingText.content?.title || '');  // Ustawienie tytułu
      setText(editingText.content?.text || '');    // Ustawienie tekstu
    }
  }, [editingText]) // Załaduj dane do edycji

  const handleSave = async () => {
    if (!title.trim() && !text.trim()) {
      alert('Proszę wpisać tytuł lub tekst.');
      return;
    }

    setLoading(true);
    const parsedId = typeof memorialId === 'string' ? parseInt(memorialId) : memorialId;
    console.log('🔍 Rozpoczynam zapis:', { title, text, editingText, memorialId: parsedId });

    let error = null;

    if (editingText) {
      const res = await supabase
        .from('memorial_mementos')
        .update({
          content: { title, text },
        })
        .eq('id', editingText.id);
      error = res.error;
      console.log('✅ Odpowiedź z Supabase (update):', res);
    } else {
      const res = await supabase
        .from('memorial_mementos')
        .insert({
          memorial_id: parsedId,
          type: 'text',
          content: { title, text },
        });
      error = res.error;
      console.log('✅ Odpowiedź z Supabase (insert):', res);
    }

    if (error) {
      alert('Wystąpił błąd podczas zapisywania.');
      console.error(error);
    } else {
      onClose();
    }

    setLoading(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={() => onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0b1426]/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto px-4 py-10 sm:px-6">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-6 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 translate-y-6 scale-95"
            >
              <Dialog.Panel className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-lg font-semibold">
                        +
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-semibold sm:text-3xl">Dodaj tytuł lub tekst</Dialog.Title>
                        <p className="mt-1 max-w-xl text-sm text-white/85">Stwórz akapit historii, nagłówek działu lub wspomnienie opisowe, które wzbogaci stronę pamięci.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onClose()}
                      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>

                <div className="grid gap-10 bg-white/95 px-6 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-[#0b1426]">Treść</h3>
                      <p className="text-sm text-[#0b1426]/70">Teksty pomagają uporządkować stronę i nadać jej rytm. Zadbaj o krótkie akapity i klarowne nagłówki.</p>
                    </div>
                    <div className="rounded-[28px] border border-[#dde5ec] bg-white/90 p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)] space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#0b1426] mb-2">Tytuł tekstu</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                          placeholder="Wprowadź tytuł (opcjonalnie)"
                          maxLength={100}
                        />
                        <div className="text-right text-xs text-[#0b1426]/40 mt-1">{100 - title.length} znaków pozostało</div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0b1426] mb-2">Treść</label>
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="min-h-[160px] w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                          placeholder="Opisz wspomnienie, fragment biografii lub refleksję."
                          maxLength={5000}
                        />
                        <div className="text-right text-xs text-[#0b1426]/40 mt-1">{5000 - text.length} znaków pozostało</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40 text-center lg:text-left">Podgląd</div>
                    <div className="rounded-[28px] border border-[#dce4ed] bg-white/90 p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)]">
                      <div className="text-center text-base font-semibold text-[#0b1426] line-clamp-3 min-h-[48px]">
                        {title || 'Tytuł tekstu'}
                      </div>
                      <div className="mt-4 text-sm leading-relaxed text-[#0b1426]/80 whitespace-pre-wrap line-clamp-8 min-h-[120px]">
                        {text || 'Twój tekst pojawi się tutaj podczas pisania.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/30 bg-white/90 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                  <button
                    onClick={() => onClose()}
                    className="rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 ${
                      loading ? 'cursor-wait opacity-80' : ''
                    }`}
                  >
                    {loading ? 'Zapisywanie…' : 'Zapisz tekst'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
