'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Dialog } from '@headlessui/react'

interface AddTextModalProps {
  isOpen: boolean
  onClose: () => void
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

    // Używamy update zamiast upsert do edycji istniejącego wpisu
    const { error } = await supabase
      .from('memorial_mementos')
      .update({
        content: { title, text },
      })
      .eq('memorial_id', parsedId)
      .eq('type', 'text');

    if (error) {
      alert('Wystąpił błąd podczas zapisywania.');
      console.error(error);
    } else {
      onClose();
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
              <span className="text-white font-medium">Dodaj tytuł lub tekst</span>
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
                  <h3 className="text-lg font-semibold mb-2">Dodaj tytuł lub tekst</h3>
                  <p className="text-gray-600 text-sm">
                    Skup się na słowach i historii dzięki historii tekstowej. Możesz także wykorzystać ją do tworzenia nagłówków i separatorów na stronie Życie i Pamiątki.
                  </p>
                </div>
                <div className="border p-8 rounded-xl bg-white space-y-8">
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Tytuł tekstu
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50"
                      placeholder="Wprowadź tytuł"
                      maxLength={100}
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{100 - title.length} znaków pozostało</div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2">Treść tekstu</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50 resize-y min-h-[80px]"
                      placeholder="Wprowadź tekst"
                      maxLength={5000}
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{5000 - text.length} znaków pozostało</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[430px] flex flex-col">
              <h4 className="text-gray-400 text-xs font-medium mb-4 text-center w-full uppercase" style={{ letterSpacing: '2px' }}>Podgląd</h4>
              <div className="border border-[2px] border-dashed border-cyan-400 rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-500 overflow-hidden space-y-0">
                <div className="text-center text-lg font-semibold text-gray-800 break-words whitespace-pre-wrap w-full max-w-[300px] min-h-[50px] overflow-hidden line-clamp-3">
                  {title || "Tytuł tekstu"}
                </div>
                <div className="text-center text-base text-gray-800 break-words whitespace-pre-wrap w-full max-w-[450px] overflow-hidden line-clamp-4">
                  {text || "Twój tekst pojawi się tutaj podczas pisania."}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}