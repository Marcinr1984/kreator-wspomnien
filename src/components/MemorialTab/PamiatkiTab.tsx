import {
  PlusIcon,
  PencilSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  BookmarkIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AddQuoteModal from '../../components/AddQuoteModal';
import AddTextModal from '../../components/AddTextModal';
import AddMapModal from '../../components/AddMapModal';
import AddPhotoModal from '../../components/AddPhotoModal';
import { supabase } from '../../utils/supabaseClient';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PamiatkiTabProps {
  setIsEditing: (value: boolean) => void;
  memorialId: number;
}

const PamiatkiTab: React.FC<PamiatkiTabProps> = ({ setIsEditing, memorialId }) => {
  const [localEditing, setLocalEditing] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [isAddMapModalOpen, setIsAddMapModalOpen] = useState(false);
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [mementos, setMementos] = useState<any[]>([]);
  const [editingMemento, setEditingMemento] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mementoToDelete, setMementoToDelete] = useState<number | string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  // Stan interaktywności i pełnego ekranu mapy
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  // Nowy stan: czy przeglądarka jest w trybie pełnoekranowym
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  // Ref do mapy w trybie pełnoekranowym
  const mapRef = useRef<any>(null);

  // Nasłuchuj zmiany pełnego ekranu i ustawiaj isBrowserFullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setIsBrowserFullscreen(fullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const fetchMementos = async () => {
    if (!memorialId) {
      console.error('Brak memorialId! Nie można pobrać pamiątek.');
      return;
    }

    const { data, error } = await supabase
      .from('memorial_mementos')
      .select('*')
      .eq('memorial_id', memorialId)
      .in('type', ['quote', 'text', 'photo'])  // Pobieramy cytaty, teksty i zdjęcia
      .order('sort_order', { ascending: true });

    // Nowość: Pobieranie lokalizacji z memorial_maps
    const { data: mapsData, error: mapsError } = await supabase
      .from('memorial_maps')
      .select('*')
      .eq('memorial_id', memorialId)
      .order('sort_order', { ascending: true });

    if (mapsError) {
      console.error('Błąd pobierania lokalizacji:', mapsError.message);
    }

    const mapsAsMementos = (mapsData || []).map((map) => ({
      id: `map-${map.id}`,
      type: 'map',
      sort_order: map.sort_order,
      content: {
        title: map.title,
        story: map.story,
        address: map.address,
        lat: map.lat,
        lng: map.lng,
      },
    }));

    const allMementos = [...(data || []), ...mapsAsMementos];
    // Sortujemy allMementos po sort_order i ustawiamy do state
    setMementos(allMementos.sort((a, b) => a.sort_order - b.sort_order));
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

  const handleStopEdit = async () => {
    setLocalEditing(false);
    setIsEditing(false);
    setIsSavingOrder(true);

    const updates = mementos.map((memento, index) => ({
      id: memento.id,
      sort_order: index,
    }));

    for (const update of updates) {
      if (typeof update.id === 'string' && update.id.startsWith('map-')) {
        const mapId = update.id.replace('map-', '');
        const { error } = await supabase
          .from('memorial_maps')
          .update({ sort_order: update.sort_order })
          .eq('id', mapId);

        if (error) {
          console.error('Błąd aktualizacji sort_order dla mapy:', error.message);
        }
      } else {
        const { error } = await supabase
          .from('memorial_mementos')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) {
          console.error('Błąd aktualizacji sort_order:', error.message);
        }
      }
    }

    await fetchMementos();
    setIsSavingOrder(false);
  };

  const handleEditMemento = (memento: any) => {
    setEditingMemento(memento);

    if (memento.type === 'quote') {
      setIsAddQuoteModalOpen(true);
    } else if (memento.type === 'text') {
      setIsAddTextModalOpen(true);
    } else if (memento.type === 'photo') {
      setIsAddPhotoModalOpen(true);
    }
  };

  const handleDeleteMemento = async (id: any) => {
    setMementoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  interface SortableMementoItemProps {
    memento: any;
    localEditing: boolean;
    handleDeleteMemento: (id: number) => void;
    handleEditMemento: (memento: any) => void;
  }

  const SortableMementoItem: React.FC<SortableMementoItemProps> = ({
    memento,
    localEditing,
    handleDeleteMemento,
    handleEditMemento,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: memento.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'transform 200ms ease',
      opacity: isDragging ? 0.5 : 1,
      backgroundColor: isDragging ? '#f0f9ff' : undefined, // Jasnoniebieskie tło w trakcie przeciągania
    };

    return (
      <div ref={setNodeRef} style={style} className="w-full">
        {!localEditing && <div className="border-t border-gray-300 w-full" />}

        <div className={`relative p-8 shadow-sm w-full ${localEditing ? 'border-2 border-dashed border-gray-300 rounded-xl mb-6' : ''}`}>
          {/* DRAG HANDLE ONLY IN EDIT MODE */}
          {localEditing && (
            <div className="absolute top-4 left-4 flex items-center" {...attributes} {...listeners}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white shadow-sm hover:border-cyan-500 cursor-grab active:cursor-grabbing transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M5 14h14" />
                </svg>
              </div>
            </div>
          )}

          {/* Renderowanie cytatu, mapy, tekstu, zdjęcia */}
          {memento.type === 'quote' ? (
            <div className="relative flex flex-col items-center mt-8">
              <div className="text-cyan-500 text-[180px] leading-none absolute top-0">“</div>
              <div className="pt-[90px] text-center text-3xl italic">{memento.content?.quote}</div>
              <div className="border-t-2 border-cyan-400 w-1/5 my-6 mx-auto"></div>
              <div className="text-lg text-gray-500 text-center mb-8">- {memento.content?.author}</div>
            </div>
          ) : memento.type === 'map' ? (
            <div className="relative flex flex-col items-center mt-8">
              <div className="text-center text-2xl font-bold text-gray-900 break-words w-full max-w-[350px]">
                {memento.content?.title}
              </div>
              <div className="text-lg text-black mt-2 w-full max-w-[350px] text-center">
                {memento.content?.story}
              </div>
              <div className="text-sm text-gray-500 mt-2 text-center">{memento.content?.address}</div>
              {/* Renderowanie mapy: pełny ekran lub normalny */}
              {isMapFullscreen ? (
                <div className="fixed inset-0 z-50 bg-white">
                  {/* Zamknij pełny ekran - przycisk X w lewym górnym rogu */}
                  <button
                    onClick={() => {
                      if (document.fullscreenElement && document.exitFullscreen) {
                        document.exitFullscreen().finally(() => {
                          setIsMapFullscreen(false);
                        });
                      } else {
                        setIsMapFullscreen(false);
                      }
                    }}
                    className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* Przyciski zoom + i - przeniesione pod przycisk zamykania pełnego ekranu */}
                  <div className="absolute top-[72px] right-4 z-10 flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white">
                    <button
                      onClick={() => {
                        const zoom = mapRef.current?.getZoom();
                        if (zoom !== undefined) {
                          mapRef.current?.zoomTo(zoom + 1);
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center border-b border-gray-200 hover:bg-gray-100"
                    >
                      <span className="text-cyan-500 text-2xl">+</span>
                    </button>
                    <button
                      onClick={() => {
                        const zoom = mapRef.current?.getZoom();
                        if (zoom !== undefined) {
                          mapRef.current?.zoomTo(zoom - 1);
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                    >
                      <span className="text-cyan-500 text-2xl">−</span>
                    </button>
                  </div>
                  <Map
                    ref={mapRef}
                    initialViewState={{
                      latitude: memento.content?.lat,
                      longitude: memento.content?.lng,
                      zoom: 17
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    scrollZoom
                    dragPan
                    dragRotate
                    doubleClickZoom
                    touchZoomRotate
                  >
                    <Marker latitude={memento.content?.lat} longitude={memento.content?.lng} />
                  </Map>
                  {/* Przycisk w prawym górnym rogu do obsługi pełnego ekranu przeglądarki */}
                  <button
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen?.();
                      } else {
                        document.exitFullscreen?.();
                      }
                    }}
                    className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-lg"
                  >
                    {isBrowserFullscreen ? (
                      <ArrowsPointingInIcon className="w-6 h-6 text-cyan-500" />
                    ) : (
                      <ArrowsPointingOutIcon className="w-6 h-6 text-cyan-500" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="w-full h-[400px] mt-4 rounded-lg overflow-hidden relative">
                  <Map
                    initialViewState={{
                      latitude: memento.content?.lat,
                      longitude: memento.content?.lng,
                      zoom: 17
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    scrollZoom={false}
                    dragPan={false}
                    dragRotate={false}
                    doubleClickZoom={false}
                    touchZoomRotate={false}
                  >
                    <Marker latitude={memento.content?.lat} longitude={memento.content?.lng} />
                  </Map>
                  {/* Przycisk pełnoekranowy */}
                  {!localEditing && (
                    <button
                      onClick={() => {
                        setIsMapFullscreen(true);
                      }}
                      className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md"
                      title="Pokaż na pełnym ekranie"
                    >
                      <ArrowsPointingOutIcon className="w-6 h-6 text-cyan-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : memento.type === 'photo' ? (
            <div className="relative flex flex-col items-center mt-8">
              <div
                className={`w-full flex flex-col md:flex-row gap-4 items-center justify-between ${
                  memento.content?.layout === 'right' ? 'md:flex-row-reverse' : ''
                }`}
              >
                {memento.content?.image_url && (
                  <div className="w-full md:w-[300px] rounded-xl overflow-hidden shadow">
                    <img
                      src={memento.content.image_url}
                      alt={memento.content.title || 'Zdjęcie'}
                      className="w-full max-h-[300px] object-cover"
                    />
                  </div>
                )}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left px-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {memento.content?.date}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {memento.content?.title}
                  </div>
                  <div className="text-base text-gray-700 whitespace-pre-wrap">
                    {memento.content?.description}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Renderowanie tytułu i tekstu
            <div className="relative flex flex-col items-center mt-8">
              <div className="text-center text-3xl font-bold text-gray-900 break-words w-full max-w-[350px] min-h-[50px] overflow-hidden line-clamp-3">
                {memento.content?.title}
              </div>
              <div className="text-lg text-black mt-4 w-full max-w-[350px] break-words whitespace-pre-wrap text-center">
                {memento.content?.text}
              </div>
            </div>
          )}

          {/* PRZYCISKI EDYCJI */}
          {localEditing && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDeleteMemento(memento.id)}
                className="flex items-center justify-center rounded-full border border-gray-300 w-10 h-10 hover:border-cyan-500"
                title="Usuń"
              >
                <TrashIcon className="h-5 w-5 text-cyan-500" />
              </button>
              {/* Przycisk edytuj cytat */}
              {memento.type === 'quote' && (
                <button
                  onClick={() => handleEditMemento(memento)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 hover:border-cyan-500 text-sm font-medium"
                  title="Edytuj cytat"
                >
                  <PencilSquareIcon className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-800">Edytuj cytat</span>
                </button>
              )}
              {/* Przycisk edytuj tytuł/tekst */}
              {memento.type === 'text' && (
                <button
                  onClick={() => handleEditMemento(memento)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 hover:border-cyan-500 text-sm font-medium"
                  title="Edytuj tytuł/tekst"
                >
                  <PencilSquareIcon className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-800">Edytuj tytuł/tekst</span>
                </button>
              )}
              {/* Przycisk edytuj lokalizację */}
              {memento.type === 'map' && (
                <button
                  onClick={() => {
                    setEditingMemento(memento);
                    setIsAddMapModalOpen(true);
                  }}
                  className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 hover:border-cyan-500 text-sm font-medium"
                  title="Edytuj lokalizację"
                >
                  <PencilSquareIcon className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-800">Edytuj lokalizację</span>
                </button>
              )}
              {/* Przycisk edytuj zdjęcie */}
              {memento.type === 'photo' && (
                <button
                  onClick={() => {
                    setEditingMemento(memento);
                    setIsAddPhotoModalOpen(true);
                  }}
                  className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 hover:border-cyan-500 text-sm font-medium"
                  title="Edytuj zdjęcie"
                >
                  <PencilSquareIcon className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-800">Edytuj zdjęcie</span>
                </button>
              )}
            </div>
          )}
        </div>

        {!localEditing && <div className="border-b border-gray-300 w-full mb-6" />}
      </div>
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = mementos.findIndex((item) => item.id === active.id);
      const newIndex = mementos.findIndex((item) => item.id === over?.id);

      const newOrder = arrayMove(mementos, oldIndex, newIndex);
      setMementos(newOrder);
    }
  };

  return (
    <div className="p-4">
      {/* Przycisk Edytuj lub Zobacz */}
      <div className="flex justify-center mb-4">
        {!localEditing ? (
          <button
            onClick={handleStartEdit}
            className="bg-gray-900 text-white py-2 px-6 rounded-lg flex items-center justify-center gap-2 min-w-[350px]"
          >
            <PencilSquareIcon className="w-5 h-5 text-white" />
            <span>Edytuj wspomnienia</span>
          </button>
        ) : (
          <button
            onClick={handleStopEdit}
            className="bg-gray-900 text-white py-2 px-6 rounded-lg flex items-center justify-center gap-2 min-w-[350px]"
          >
            <EyeIcon className="w-5 h-5 text-white" />
            <span>Zobacz wspomnienia</span>
          </button>
        )}
      </div>

      {isSavingOrder && (
        <div className="text-center text-gray-500 text-sm my-2">
          Zapisywanie zmian...
        </div>
      )}

      {/* Sekcja dla edycji - przyciski dodawania */}
      {localEditing && (
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center mt-20">
          <h2 className="text-lg font-semibold mb-10">Opowiedz nam o życiu tej osoby</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={() => {
                setEditingMemento(null);
                setIsAddMapModalOpen(true);
              }}
              className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium"
            >
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              Dodaj mapę
            </button>
            <button
              onClick={() => {
                setEditingMemento(null);
                setIsAddTextModalOpen(true);
              }}
              className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium"
            >
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
            <button
              onClick={() => {
                setEditingMemento(null);
                setIsAddPhotoModalOpen(true);
              }}
              className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium"
            >
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              Dodaj zdjęcia
            </button>
            <button className="border border-gray-300 h-10 py-1.5 px-4 rounded-full hover:border-cyan-500 flex items-center gap-2 justify-center text-sm font-medium">
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              Dodaj film
            </button>
          </div>
        </div>
      )}

      {/* Cytaty, teksty i mapy */}
      {localEditing ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={mementos.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col items-center justify-center mt-28 w-full">
              {mementos
                .filter((memento) => memento?.type && memento?.content) // zapobiega renderowaniu pustych map
                .map((memento) => (
                  <SortableMementoItem
                    key={memento.id}
                    memento={memento}
                    localEditing={localEditing}
                    handleDeleteMemento={handleDeleteMemento}
                    handleEditMemento={handleEditMemento}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center mt-28 w-full">
          {mementos
            .filter((memento) => memento?.type && memento?.content) // zapobiega renderowaniu pustych map
            .map((memento) => (
              <SortableMementoItem
                key={memento.id}
                memento={memento}
                localEditing={localEditing}
                handleDeleteMemento={handleDeleteMemento}
                handleEditMemento={handleEditMemento}
              />
            ))}
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="rounded-lg overflow-hidden max-w-xl w-full shadow-lg">
            <div className="bg-white p-6 relative flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-bold">Czy na pewno chcesz to usunąć?</h2>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setMementoToDelete(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 absolute top-4 right-4"
                  aria-label="Zamknij"
                >
                  <span>Zamknij</span>
                  <span className="text-lg">×</span>
                </button>
              </div>
              <div className="text-gray-600 text-left ml-0 mt-4">
                Jeśli chcesz trwale usunąć ten element, kliknij 'Usuń'. Aby anulować, kliknij 'Anuluj'.
              </div>
            </div>
            <div className="bg-gray-100 p-4 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMementoToDelete(null);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={async () => {
                  if (mementoToDelete !== null) {
                    // Obsługa usuwania mapy (jeśli mementoToDelete jest stringiem i zaczyna się od "map-")
                    if (typeof mementoToDelete === 'string' && mementoToDelete.startsWith('map-')) {
                      const mapId = mementoToDelete.replace('map-', '');
                      const { error } = await supabase.from('memorial_maps').delete().eq('id', mapId);
                      if (error) {
                        console.error('Błąd usuwania mapy:', error.message);
                      } else {
                        await fetchMementos();
                      }
                    } else if (typeof mementoToDelete !== 'string') {
                      // Najpierw pobierz dane pamiątki, żeby sprawdzić czy to zdjęcie i usunąć je ze storage
                      const { data: mementoData } = await supabase
                        .from('memorial_mementos')
                        .select('*')
                        .eq('id', mementoToDelete)
                        .single();

                      // Nowy kod usuwania zdjęcia ze storage:
                      if (mementoData?.type === 'photo' && mementoData?.content?.image_url) {
                        const imageUrl = mementoData.content.image_url;

                        try {
                          const url = new URL(imageUrl);
                          const path = url.pathname.split('/storage/v1/object/public/memorial-photos/')[1];
                          console.log('Ścieżka do usunięcia:', JSON.stringify(path));
                          if (!path || !path.includes('68/')) {
                            console.warn('⚠️ Ścieżka zdjęcia wygląda podejrzanie, nie usuwam:', path);
                            return;
                          }
                          if (!path) {
                            console.warn('⚠️ Nie udało się wyciągnąć ścieżki zdjęcia ze storage!');
                          } else {
                            const { error: storageError } = await supabase
                              .storage
                              .from('memorial-photos')
                              .remove([path]);

                            if (storageError) {
                              console.error('❌ Błąd usuwania pliku ze storage:', storageError.message);
                            } else {
                              console.log('✅ Usunięto plik ze storage:', path);
                            }
                          }
                        } catch (e) {
                          console.error('❌ Wyjątek podczas usuwania zdjęcia ze storage:', e);
                        }
                      }

                      const { error } = await supabase
                        .from('memorial_mementos')
                        .delete()
                        .eq('id', mementoToDelete);
                      if (error) {
                        console.error('Błąd podczas usuwania pamiątki:', error.message);
                      } else {
                        await fetchMementos();
                      }
                    }
                  }
                  setIsDeleteModalOpen(false);
                  setMementoToDelete(null);
                }}
                className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dla cytatów */}
      {isAddQuoteModalOpen && (
        <AddQuoteModal
          isOpen={isAddQuoteModalOpen}
          onClose={async (newQuote) => {
            setIsAddQuoteModalOpen(false);
            setEditingMemento(null);  // Wyczyszczenie danych po zamknięciu modalu
            if (newQuote && !editingMemento) {
              // Dodajemy nowy cytat na początek z sort_order: 0
              setMementos((prev) => [
                { ...newQuote, sort_order: 0 },
                ...prev,
              ]);
            } else {
              await fetchMementos();
            }
          }}
          memorialId={memorialId}
          editingQuote={editingMemento} // Przekazujemy dane do edycji cytatu
        />
      )}

      {/* Modal dla tytułów/tekstów */}
      {isAddTextModalOpen && (
        <AddTextModal
          isOpen={isAddTextModalOpen}
          onClose={async (newText) => {
            console.log("📥 Modal zamknięty, odświeżam dane...");
            setIsAddTextModalOpen(false);
            if (newText && !editingMemento) {
              setMementos((prev) => [
                { ...newText, sort_order: 0 },
                ...prev,
              ]);
            } else {
              await fetchMementos();
            }
          }}
          memorialId={memorialId}
          editingText={editingMemento}
        />
      )}

      {/* Modal dla mapy */}
      {isAddMapModalOpen && (
        <AddMapModal
          isOpen={isAddMapModalOpen}
          onClose={async (newMap) => {
            setIsAddMapModalOpen(false);
            if (newMap && !editingMemento) {
              setMementos((prev) => [
                { ...newMap, sort_order: 0 },
                ...prev,
              ]);
            } else {
              await fetchMementos();
            }
            setEditingMemento(null);
          }}
          memorialId={memorialId}
          editingMap={editingMemento}
        />
      )}
      {/* Modal dla zdjęć */}
      {isAddPhotoModalOpen && (
        <AddPhotoModal
          isOpen={isAddPhotoModalOpen}
          onClose={async (newPhoto) => {
            setIsAddPhotoModalOpen(false);
            if (newPhoto && !editingMemento) {
              setMementos((prev) => [
                { ...newPhoto, sort_order: 0 },
                ...prev,
              ]);
            } else {
              await fetchMementos();
            }
            setEditingMemento(null);
          }}
          memorialId={memorialId}
          editingPhoto={editingMemento}
        />
      )}
    </div>
  );
};

export default PamiatkiTab;