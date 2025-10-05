'use client'

import { Fragment, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Dialog, Transition } from '@headlessui/react'
import { SparklesIcon } from '@heroicons/react/24/solid'

interface AddQuoteModalProps {
  isOpen: boolean
  onClose: (newQuote?: any) => void
  memorialId: string | number
  editingQuote?: any | null;
}

export default function AddQuoteModal({ isOpen, onClose, memorialId, editingQuote }: AddQuoteModalProps) {
  const [quote, setQuote] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingQuote) {
      setQuote(editingQuote.content.quote || '');
      setAuthor(editingQuote.content.author || '');
    } else {
      setQuote('');
      setAuthor('');
    }
  }, [editingQuote, isOpen]);

  const handleSave = async () => {
    if (!quote.trim()) {
      alert('Proszę wpisać cytat.')
      return
    }
    if (quote.length > 1000) {
      alert('Cytat może mieć maksymalnie 1000 znaków.');
      setLoading(false);
      return;
    }
    if (author.length > 298) {
      alert('Autor może mieć maksymalnie 298 znaków.');
      setLoading(false);
      return;
    }
    setLoading(true)

    if (editingQuote) {
      const { error } = await supabase
        .from('memorial_mementos')
        .update({ content: { quote, author } })
        .eq('id', editingQuote.id);

      if (error) {
        alert('Wystąpił błąd podczas aktualizacji.');
        console.error(error);
      } else {
        onClose();
      }
    } else {
      const parsedId = typeof memorialId === 'string' ? parseInt(memorialId) : memorialId;
      const { error } = await supabase.from('memorial_mementos').insert({
        memorial_id: parsedId,
        type: 'quote',
        content: { quote, author },
      });

      if (error) {
        alert('Wystąpił błąd podczas zapisywania.');
        console.error(error);
      } else {
        onClose();
      }
    }
    setLoading(false);
  }

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
              <Dialog.Panel className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20">
                        <SparklesIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-semibold sm:text-3xl">Dodaj cytat</Dialog.Title>
                        <p className="mt-1 max-w-xl text-sm text-white/85">Utrwal ukochane słowa, powiedzenie lub fragment książki, które najlepiej oddają charakter osoby upamiętnionej.</p>
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
                      <h3 className="text-lg font-semibold text-[#0b1426]">Treść cytatu</h3>
                      <p className="text-sm text-[#0b1426]/70">Zapisz cytat oraz – jeśli chcesz – jego autora. Dla zachowania czytelności unikaj bardzo długich fragmentów.</p>
                    </div>
                    <div className="rounded-[28px] border border-[#dde5ec] bg-white/90 p-6 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.28)] space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#0b1426] mb-2">Treść cytatu *</label>
                        <textarea
                          value={quote}
                          onChange={(e) => setQuote(e.target.value)}
                          className="min-h-[160px] w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          placeholder="Wpisz cytat lub fragment, który chcesz zachować."
                          maxLength={1000}
                        />
                        <div className="text-right text-xs text-[#0b1426]/40 mt-1">{1000 - quote.length} znaków pozostało</div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0b1426] mb-2">Autor</label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          placeholder="Dodaj autora lub źródło (opcjonalnie)"
                          maxLength={298}
                        />
                        <div className="text-right text-xs text-[#0b1426]/40 mt-1">{298 - author.length} znaków pozostało</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40 text-center lg:text-left">Podgląd</div>
                    <div className="rounded-[28px] border border-[#dce4ed] bg-gradient-to-b from-white/95 via-white to-white/90 p-6 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.28)] text-center">
                      <div className="relative flex flex-col items-center">
                        <span className="text-6xl font-serif text-rose-400/70">“</span>
                        <p className="mt-4 text-base italic text-[#0b1426]/80 whitespace-pre-wrap leading-relaxed line-clamp-6 min-h-[120px]">
                          {quote || 'Twój cytat pojawi się tutaj podczas pisania.'}
                        </p>
                        <span className="mt-6 block h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
                        <p className="mt-2 text-sm font-semibold text-[#0b1426]/60">{author || 'Autor nieznany'}</p>
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
                    className={`rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:shadow-rose-500/45 ${
                      loading ? 'cursor-wait opacity-80' : ''
                    }`}
                  >
                    {loading ? 'Zapisywanie…' : editingQuote ? 'Zapisz zmiany' : 'Dodaj cytat'}
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
