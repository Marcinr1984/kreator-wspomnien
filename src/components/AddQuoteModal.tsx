'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Dialog } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/24/solid'

interface AddQuoteModalProps {
  isOpen: boolean
  onClose: () => void
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
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="w-[1100px] h-[620px] flex flex-col overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
          <div className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center rounded-full text-white text-xl font-bold">
                +
              </div>
              <span className="text-white font-medium">Dodaj cytat</span>
            </div>
            <button
              onClick={onClose}
              className="text-black bg-white rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-200"
            >
              Zamknij
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 gap-8 flex">
            <div className="w-[550px] flex-shrink-0 flex flex-col justify-between">
              <div>
                <div className="w-full mb-8">
                  <h3 className="text-lg font-semibold mb-2">Dodaj historię cytatu</h3>
                  <p className="text-gray-600 text-sm">
                    Historia cytatu może ożywić ulubione wersety, aforyzmy, fragmenty książek lub często powtarzane powiedzenia bliskiej osoby.
                  </p>
                </div>
                <div className="border p-8 rounded-xl bg-white space-y-8">
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Wprowadź cytat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      className="w-full max-w-full border rounded-lg p-4 text-sm bg-gray-50 resize-y min-h-[55px]"
                      placeholder="Wpisz cytat"
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{1000 - quote.length} znaków pozostało</div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2">Kto jest autorem cytatu?</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50"
                      placeholder="Wpisz autora (opcjonalnie)"
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{298 - author.length} znaków pozostało</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[550px] flex flex-col">
              <h4 className="text-gray-400 text-xs font-medium mb-4 text-center w-full uppercase" style={{ letterSpacing: '2px' }}>Podgląd</h4>
              <div className="border border-[2px] border-dashed border-cyan-400 rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-500 overflow-hidden">
                <div className="relative flex flex-col items-center mt-2 w-full">
                  <div className="text-cyan-500 text-[180px] leading-none absolute top-0">“</div>
                  <div className="pt-[90px] text-center text-lg italic break-words w-full max-w-[350px] min-h-[150px] overflow-hidden line-clamp-3">
                    {quote || "Twój tekst pojawi się tutaj podczas pisania."}
                  </div>
                </div>
                <div className="border-t-2 border-cyan-400 w-1/3 my-4 mx-auto"></div>
                <div className="text-sm text-gray-400">{author || "- Autor -"}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : editingQuote ? 'Zapisz zmiany' : 'Zapisz'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}