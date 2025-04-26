import {
  PlusIcon,
  PencilSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import React, { useState, useEffect } from 'react';
import AddQuoteModal from '../../components/AddQuoteModal';
import { supabase } from '../../utils/supabaseClient';

interface PamiatkiTabProps {
  setIsEditing: (value: boolean) => void;
  memorialId: number;
}

const PamiatkiTab: React.FC<PamiatkiTabProps> = ({ setIsEditing, memorialId }) => {
  const [localEditing, setLocalEditing] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [mementos, setMementos] = useState<any[]>([]);

  const fetchMementos = async () => {
    if (!memorialId) {
      console.error('Brak memorialId! Nie można pobrać pamiątek.');
      return;
    }

    const { data, error } = await supabase
      .from('memorial_mementos')
      .select('*')
      .eq('memorial_id', memorialId)
      .eq('type', 'quote')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Błąd pobierania pamiątek:', error.message);
    } else {
      setMementos(data || []);
    }
  };

  useEffect(() => {
    if (memorialId) {
      fetchMementos();
    }
  }, [memorialId]);

  const handleStartEdit = () => {
    setLocalEditing(true);
    setIsEditing(true);
  };

  const handleStopEdit = () => {
    setLocalEditing(false);
    setIsEditing(false);
  };

  return (
    <div className="p-4">
      {!localEditing ? (
        <div className="flex justify-center">
          <button
            onClick={handleStartEdit}
            className="bg-gray-900 text-white py-2 px-6 rounded-lg flex items-center justify-center gap-2 min-w-[350px]"
          >
            <PencilSquareIcon className="w-5 h-5 text-white" />
            <span>Edytuj wspomnienia</span>
          </button>
        </div>
      ) : (
        <>
          {/* Przycisk Wyświetl */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleStopEdit}
              className="bg-gray-900 text-white py-2 px-6 rounded-lg flex items-center justify-center gap-2 min-w-[350px]"
            >
              <EyeIcon className="w-5 h-5 text-white" />
              <span>Zobacz wspomnienia</span>
            </button>
          </div>

          {/* Ramka edycji */}
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center mt-20">
            <h2 className="text-lg font-semibold mb-10">Opowiedz nam o życiu tej osoby</h2>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <button className="border border-gray-300 py-2 px-3 rounded-full hover:bg-gray-100 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj mapę
              </button>
              <button className="border border-gray-300 py-2 px-3 rounded-full hover:bg-gray-100 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj tytuł lub tekst
              </button>
              <button
                onClick={() => setIsAddQuoteModalOpen(true)}
                className="border border-gray-300 py-2 px-3 rounded-full hover:bg-gray-100 flex items-center gap-2 justify-center text-sm font-medium"
              >
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj cytat
              </button>
              <button className="border border-gray-300 py-2 px-3 rounded-full hover:bg-gray-100 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj ważne momenty
              </button>
              <button className="border border-gray-300 py-2 px-3 rounded-full hover:bg-gray-100 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj wspomnienie
              </button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              {mementos.map((memento) => (
                <div key={memento.id} className="border-2 border-dashed border-cyan-400 rounded-xl p-6 w-[400px] flex flex-col items-center relative">
                  <div className="text-cyan-500 text-4xl mb-4">“</div>
                  <div className="text-center text-lg italic mb-2">{memento.content?.quote}</div>
                  <div className="border-t border-cyan-400 w-1/2 my-2"></div>
                  <div className="text-sm text-gray-500">- {memento.content?.author}</div>
                </div>
              ))}
            </div>
          </div>
          {isAddQuoteModalOpen && (
            <AddQuoteModal
              isOpen={isAddQuoteModalOpen}
              onClose={async () => {
                setIsAddQuoteModalOpen(false);
                await fetchMementos();
              }}
              memorialId={memorialId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PamiatkiTab;