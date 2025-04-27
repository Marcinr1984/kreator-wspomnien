'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Dialog } from '@headlessui/react'

interface AddMapModalProps {
  isOpen: boolean
  onClose: () => void
  memorialId: string | number
  editingText?: any | null;
}

export default function AddMapModal({ isOpen, onClose, memorialId, editingText }: AddMapModalProps) {
  const [mapTitle, setMapTitle] = useState('');
  const [mapStory, setMapStory] = useState('');
  const [mapAddress, setMapAddress] = useState('');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingText) {
      setMapTitle(editingText.content?.mapTitle || '');
      setMapStory(editingText.content?.mapStory || '');
      setMapAddress(editingText.content?.mapAddress || '');
    }
  }, [editingText])

  const handleSave = async () => {
    if (!mapTitle.trim() && !mapStory.trim() && !mapAddress.trim()) {
      alert('Proszę wpisać nazwę miejsca, historię lub adres.');
      return;
    }
    setLoading(true);

    const parsedId = typeof memorialId === 'string' ? parseInt(memorialId) : memorialId;

    // Przygotowanie struktury danych (bez zapisu)
    const content = {
      mapTitle,
      mapStory,
      mapAddress,
    };

    // Tutaj można dodać zapis do bazy danych, gdy będzie gotowy

    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="z-50 w-[1100px] h-[730px] flex flex-col overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
          <div className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center rounded-full text-white text-xl font-bold">
                +
              </div>
              <span className="text-white font-medium">Dodaj miejsce na mapie</span>
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
                  <h3 className="text-lg font-semibold mb-2">Dodaj miejsce na mapie</h3>
                  <p className="text-gray-600 text-sm">
                    Opowiedz historię miejsca, dodaj jego nazwę oraz adres.
                  </p>
                </div>
                <div className="border p-8 rounded-xl bg-white space-y-8">
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Nazwa miejsca
                    </label>
                    <input
                      type="text"
                      value={mapTitle}
                      onChange={(e) => setMapTitle(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50"
                      placeholder="Wprowadź nazwę miejsca"
                      maxLength={100}
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{100 - mapTitle.length} znaków pozostało</div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2">Historia miejsca</label>
                    <textarea
                      value={mapStory}
                      onChange={(e) => setMapStory(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50 resize-y"
                      placeholder="Wprowadź historię miejsca"
                      maxLength={1000}
                    />
                    <div className="text-right text-xs mt-1 text-gray-400">{1000 - mapStory.length} znaków pozostało</div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Adres
                    </label>
                    <input
                      type="text"
                      value={mapAddress}
                      onChange={(e) => setMapAddress(e.target.value)}
                      className="w-full border rounded-lg p-4 text-sm bg-gray-50"
                      placeholder="Wprowadź adres"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[430px] flex flex-col">
              <h4 className="text-gray-400 text-xs font-medium mb-4 text-center w-full uppercase" style={{ letterSpacing: '2px' }}>Podgląd mapy</h4>
              <div className="border border-[2px] border-dashed border-cyan-400 rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-500 overflow-hidden space-y-0">
                <div className="text-center text-lg font-semibold text-gray-800 break-words whitespace-pre-wrap w-full max-w-[300px] min-h-[50px] overflow-hidden line-clamp-3">
                  {mapTitle || "Nazwa miejsca"}
                </div>
                <div className="text-center text-sm text-gray-600 break-words whitespace-pre-wrap w-full max-w-[450px] overflow-hidden line-clamp-2">
                  {mapAddress || "Adres miejsca"}
                </div>
                <div className="mt-6 w-full h-[200px] bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-300 rounded-lg">
                  Mapa będzie tutaj
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