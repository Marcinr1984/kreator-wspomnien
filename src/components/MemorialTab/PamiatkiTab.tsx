import {
  PlusIcon,
  PencilSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import React, { useState } from 'react';

interface PamiatkiTabProps {
  setIsEditing: (value: boolean) => void;
}

const PamiatkiTab: React.FC<PamiatkiTabProps> = ({ setIsEditing }) => {
  const [localEditing, setLocalEditing] = useState(false);

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
              <button className="border border-gray-300 py-2 px-3 rounded-full hover:bg-gray-100 flex items-center gap-2 justify-center text-sm font-medium">
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
          </div>
        </>
      )}
    </div>
  );
};

export default PamiatkiTab;