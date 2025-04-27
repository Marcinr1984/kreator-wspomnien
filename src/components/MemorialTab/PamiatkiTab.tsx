import {
  PlusIcon,
  PencilSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  BookmarkIcon,
  EyeIcon,
  TrashIcon
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
  const [editingMemento, setEditingMemento] = useState<any | null>(null);

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

  const handleEditMemento = (memento: any) => {
    setEditingMemento(memento);
    setIsAddQuoteModalOpen(true);
  };

  const handleDeleteMemento = async (id: number) => {
    const confirmDelete = window.confirm('Czy na pewno chcesz usunąć ten cytat?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('memorial_mementos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Błąd podczas usuwania pamiątki:', error.message);
    } else {
      await fetchMementos();
    }
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
              <button className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj mapę
              </button>
              <button className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj tytuł lub tekst
              </button>
              <button
                onClick={() => {
                  setEditingMemento(null);
                  setIsAddQuoteModalOpen(true);
                }}
                className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium"
              >
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj cytat
              </button>
              <button className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj ważne momenty
              </button>
              <button className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium">
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Dodaj wspomnienie
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-28 w-full">
            {mementos.map((memento) => (
              <div key={memento.id} className="relative border-2 border-dashed border-gray-300 p-8 rounded-xl shadow-sm mb-6 w-full">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleDeleteMemento(memento.id)}
                    className="flex items-center justify-center rounded-full border border-gray-300 w-10 h-10 hover:border-cyan-500"
                    title="Usuń"
                  >
                    <TrashIcon className="h-5 w-5 text-cyan-500" />
                  </button>
                  <button
                    onClick={() => handleEditMemento(memento)}
                    className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 hover:border-cyan-500 text-sm font-medium"
                    title="Edytuj cytat"
                  >
                    <PencilSquareIcon className="h-5 w-5 text-cyan-500" />
                    <span className="text-gray-800">Edytuj cytat</span>
                  </button>
                </div>
                <div className="relative flex flex-col items-center mt-8">
                  <div className="text-cyan-500 text-[180px] leading-none absolute top-0">“</div>
                  <div className="pt-[90px] text-center text-4xl italic">{memento.content?.quote}</div>
                </div>
                <div className="border-t-2 border-cyan-400 w-1/5 my-6 mx-auto"></div>
                <div className="text-lg text-gray-500 text-center mb-8">- {memento.content?.author}</div>
              </div>
            ))}
          </div>

          {isAddQuoteModalOpen && (
            <AddQuoteModal
              isOpen={isAddQuoteModalOpen}
              onClose={async () => {
                setIsAddQuoteModalOpen(false);
                setEditingMemento(null);
                await fetchMementos();
              }}
              memorialId={memorialId}
              editingQuote={editingMemento}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PamiatkiTab;