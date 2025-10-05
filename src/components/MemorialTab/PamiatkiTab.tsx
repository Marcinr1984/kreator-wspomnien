'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import AddQuoteModal from '../../components/AddQuoteModal'
import AddTextModal from '../../components/AddTextModal'
import AddMapModal from '../../components/AddMapModal'
import AddPhotoModal from '../../components/AddPhotoModal'
import { supabase } from '../../utils/supabaseClient'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  PlusIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  PhotoIcon as PhotoSolidIcon,
  DocumentTextIcon,
  SparklesIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid'
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

interface PamiatkiTabProps {
  setIsEditing: (value: boolean) => void
  memorialId: number
  isEditing?: boolean
  isPublicView?: boolean
}

type Memento = {
  id: number | string
  type: 'quote' | 'text' | 'photo' | 'map'
  sort_order: number
  content: any
}

const CARD_BASE =
  'relative overflow-hidden rounded-[32px] border border-white/60 bg-white/95 shadow-[0_20px_52px_-32px_rgba(14,116,144,0.28)] backdrop-blur px-8 py-10 sm:px-10'

const ACTION_BUTTON =
  'inline-flex items-center gap-2 rounded-full border border-[#d4dde5] bg-white/90 px-4 py-1.5 text-xs font-semibold text-[#0b1426]/70 transition hover:border-cyan-400 hover:text-cyan-600'

const PRIMARY_GRADIENT_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45'

const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]'

const PamiatkiTab: React.FC<PamiatkiTabProps> = ({ setIsEditing, memorialId, isEditing = false, isPublicView = false }) => {
  const [localEditing, setLocalEditing] = useState(false)
  const [mementos, setMementos] = useState<Memento[]>([])
  const [editingMemento, setEditingMemento] = useState<any | null>(null)
  const [mementoToDelete, setMementoToDelete] = useState<number | string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false)
  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false)
  const [isAddMapModalOpen, setIsAddMapModalOpen] = useState(false)
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false)

  const [fullscreenMap, setFullscreenMap] = useState<Memento | null>(null)

  const fetchMementos = async () => {
    if (!memorialId) return

    const { data, error } = await supabase
      .from('memorial_mementos')
      .select('*')
      .eq('memorial_id', memorialId)
      .in('type', ['quote', 'text', 'photo'])
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Błąd pobierania pamiątek:', error.message)
    }

    const { data: mapsData, error: mapsError } = await supabase
      .from('memorial_maps')
      .select('*')
      .eq('memorial_id', memorialId)
      .order('sort_order', { ascending: true })

    if (mapsError) {
      console.error('Błąd pobierania lokalizacji:', mapsError.message)
    }

    const mapsAsMementos: Memento[] = (mapsData || []).map((map) => ({
      id: `map-${map.id}`,
      type: 'map',
      sort_order: map.sort_order ?? 0,
      content: {
        title: map.title,
        story: map.story,
        address: map.address,
        lat: map.lat,
        lng: map.lng
      }
    }))

    const combined = [...(data as Memento[] | null || []), ...mapsAsMementos]
    combined.sort((a, b) => a.sort_order - b.sort_order)
    setMementos(combined)
  }

  useEffect(() => {
    fetchMementos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memorialId])

  const visibleMementos = useMemo(() => mementos.filter((item) => item?.type && item?.content), [mementos])

  const handleStartEdit = () => {
    setLocalEditing(true)
    setIsEditing(true)
  }

  const handleStopEdit = async () => {
    setLocalEditing(false)
    setIsEditing(false)
    setIsSavingOrder(true)

    const updates = visibleMementos.map((memento, index) => ({ id: memento.id, sort_order: index }))

    for (const update of updates) {
      if (typeof update.id === 'string' && update.id.startsWith('map-')) {
        const mapId = update.id.replace('map-', '')
        const { error } = await supabase.from('memorial_maps').update({ sort_order: update.sort_order }).eq('id', mapId)
        if (error) console.error('Błąd aktualizacji mapy:', error.message)
      } else {
        const { error } = await supabase
          .from('memorial_mementos')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
        if (error) console.error('Błąd aktualizacji sort_order:', error.message)
      }
    }

    await fetchMementos()
    setIsSavingOrder(false)
  }

  const handleEditMemento = (memento: Memento) => {
    setEditingMemento(memento)

    switch (memento.type) {
      case 'quote':
        setIsAddQuoteModalOpen(true)
        break
      case 'text':
        setIsAddTextModalOpen(true)
        break
      case 'photo':
        setIsAddPhotoModalOpen(true)
        break
      case 'map':
        setIsAddMapModalOpen(true)
        break
      default:
        break
    }
  }

  const handleDeleteMemento = (id: any) => {
    setMementoToDelete(id)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!mementoToDelete) return

    if (typeof mementoToDelete === 'string' && mementoToDelete.startsWith('map-')) {
      const mapId = mementoToDelete.replace('map-', '')
      const { error } = await supabase.from('memorial_maps').delete().eq('id', mapId)
      if (error) {
        console.error('Błąd usuwania mapy:', error.message)
      } else {
        await fetchMementos()
      }
    } else {
      const { data: mementoData } = await supabase
        .from('memorial_mementos')
        .select('*')
        .eq('id', mementoToDelete)
        .single()

      if (mementoData?.type === 'photo' && mementoData?.content?.image_url) {
        try {
          const url = new URL(mementoData.content.image_url)
          const path = url.pathname.split('/storage/v1/object/public/memorial-photos/')[1]
          if (path) {
            await supabase.storage.from('memorial-photos').remove([path])
          }
        } catch (e) {
          console.warn('Nie można usunąć pliku ze storage:', e)
        }
      }

      const { error } = await supabase.from('memorial_mementos').delete().eq('id', mementoToDelete)
      if (error) {
        console.error('Błąd usuwania pamiątki:', error.message)
      } else {
        await fetchMementos()
      }
    }

    setDeleteModalOpen(false)
    setMementoToDelete(null)
  }

  interface SortableMementoItemProps {
    memento: Memento
    localEditing: boolean
    onEdit: (memento: Memento) => void
    onDelete: (id: any) => void
    onExpandMap: (memento: Memento) => void
  }

  const SortableMementoItem: React.FC<SortableMementoItemProps> = ({ memento, localEditing, onEdit, onDelete, onExpandMap }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: memento.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'transform 200ms ease',
      opacity: isDragging ? 0.65 : 1
    }

    const dragHandle = localEditing ? (
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute -left-3 -top-3 hidden items-center justify-center rounded-full border border-[#d4dde5] bg-white p-3 shadow-sm transition hover:border-cyan-400 hover:text-cyan-600 sm:flex"
        aria-label="Przeciągnij, aby zmienić kolejność"
      >
        <span className="text-lg leading-none text-cyan-500">⠿</span>
      </button>
    ) : null

    const renderQuote = () => (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-6xl font-serif text-rose-400/70 leading-none">“</span>
        <p className="text-lg sm:text-xl italic leading-relaxed text-[#0b1426]/80 whitespace-pre-wrap">
          {memento.content?.quote || 'Cytat'}
        </p>
        {memento.content?.author && (
          <p className="text-sm font-semibold text-[#0b1426]/50">— {memento.content.author}</p>
        )}
      </div>
    )

    const renderText = () => (
      <div className="space-y-4 text-center sm:text-left">
        {memento.content?.title && (
          <h3 className="text-2xl font-semibold text-[#0b1426] whitespace-pre-wrap">{memento.content.title}</h3>
        )}
        {memento.content?.text && (
          <p className="text-sm leading-relaxed text-[#0b1426]/75 whitespace-pre-wrap">
            {memento.content.text}
          </p>
        )}
      </div>
    )

    const renderPhoto = () => (
      <div className={`flex flex-col gap-6 lg:flex-row ${memento.content?.layout === 'right' ? 'lg:flex-row-reverse' : ''}`}>
        {memento.content?.image_url && (
          <div className="mx-auto h-52 w-full max-w-[220px] overflow-hidden rounded-[24px] border border-[#dce4ed] bg-[#f6f9fc] lg:mx-0">
            <img src={memento.content.image_url} alt={memento.content?.title || 'Zdjęcie'} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-3 text-center lg:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-[#0b1426]/40">
            {memento.content?.date ? new Date(memento.content.date).toLocaleDateString('pl-PL') : 'Data nieznana'}
          </p>
          <h3 className="text-xl font-semibold text-[#0b1426]">{memento.content?.title}</h3>
          {memento.content?.description && (
            <p className="text-sm leading-relaxed text-[#0b1426]/75 whitespace-pre-wrap">
              {memento.content.description}
            </p>
          )}
        </div>
      </div>
    )

    const renderMap = () => (
      <div className="space-y-4">
        <div className="space-y-2 text-center lg:text-left">
          <h3 className="text-xl font-semibold text-[#0b1426]">{memento.content?.title || 'Lokalizacja na mapie'}</h3>
          {memento.content?.story && (
            <p className="text-sm leading-relaxed text-[#0b1426]/75 whitespace-pre-wrap">{memento.content.story}</p>
          )}
          {memento.content?.address && (
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f6f9fc] px-4 py-1 text-xs font-semibold text-[#0b1426]/60">
              <MapPinIcon className="h-4 w-4 text-cyan-500" />
              {memento.content.address}
            </p>
          )}
        </div>
        <div className="relative overflow-hidden rounded-[24px] border border-[#dce4ed] bg-[#f6f9fc]">
          <Map
            initialViewState={{
              latitude: memento.content?.lat,
              longitude: memento.content?.lng,
              zoom: 15
            }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            style={{ width: '100%', height: 320 }}
            scrollZoom={localEditing}
            dragPan={localEditing}
            dragRotate={false}
            touchZoomRotate={localEditing}
          >
            <Marker latitude={memento.content?.lat} longitude={memento.content?.lng} color="#06b6d4" />
          </Map>
          {!localEditing && (
            <button
              type="button"
              onClick={() => onExpandMap(memento)}
              className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-1.5 text-xs font-semibold text-[#0b1426]/70 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
              Pokaż na pełnym ekranie
            </button>
          )}
        </div>
      </div>
    )

    const renderContent = () => {
      switch (memento.type) {
        case 'quote':
          return renderQuote()
        case 'text':
          return renderText()
        case 'photo':
          return renderPhoto()
        case 'map':
          return renderMap()
        default:
          return null
      }
    }

    return (
      <div ref={setNodeRef} style={style} className="w-full">
        <div className="mx-auto w-full max-w-4xl">
          <div className={`${CARD_BASE} ${localEditing ? 'pl-14' : ''}`}>
            {dragHandle}
            {renderContent()}

            {localEditing && (
              <div className="absolute top-6 right-6 flex flex-wrap gap-2 justify-end">
                <button onClick={() => onDelete(memento.id)} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100">
                  <TrashIcon className="h-4 w-4" /> Usuń
                </button>
                <button onClick={() => onEdit(memento)} className={ACTION_BUTTON}>
                  <PencilSquareIcon className="h-4 w-4" /> Edytuj
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = visibleMementos.findIndex((item) => item.id === active.id)
    const newIndex = visibleMementos.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(visibleMementos, oldIndex, newIndex)
    setMementos(newOrder)
  }

  const renderMementoList = localEditing ? (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleMementos.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-10">
          {visibleMementos.map((memento) => (
            <SortableMementoItem
              key={memento.id}
              memento={memento}
              localEditing={localEditing}
              onEdit={handleEditMemento}
              onDelete={handleDeleteMemento}
              onExpandMap={setFullscreenMap}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="flex flex-col gap-10">
      {visibleMementos.map((memento) => (
        <SortableMementoItem
          key={memento.id}
          memento={memento}
          localEditing={false}
          onEdit={handleEditMemento}
          onDelete={handleDeleteMemento}
          onExpandMap={setFullscreenMap}
        />
      ))}
    </div>
  )

  const creationButtons = [
    {
      label: 'Dodaj mapę',
      description: 'Zaznacz ważne miejsce na mapie',
      icon: MapPinIcon,
      action: () => {
        setEditingMemento(null)
        setIsAddMapModalOpen(true)
      }
    },
    {
      label: 'Dodaj tytuł lub tekst',
      description: 'Dodaj akapit lub nagłówek historii',
      icon: DocumentTextIcon,
      action: () => {
        setEditingMemento(null)
        setIsAddTextModalOpen(true)
      }
    },
    {
      label: 'Dodaj cytat',
      description: 'Zapisz słowa, które warto zapamiętać',
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        setEditingMemento(null)
        setIsAddQuoteModalOpen(true)
      }
    },
    {
      label: 'Dodaj zdjęcie',
      description: 'Dodaj pojedyncze zdjęcie z opisem',
      icon: PhotoSolidIcon,
      action: () => {
        setEditingMemento(null)
        setIsAddPhotoModalOpen(true)
      }
    }
  ]

  return (
    <div className="space-y-12">
      {!isPublicView && (
        <div className="rounded-[32px] border border-white/60 bg-white/95 px-6 py-6 shadow-[0_20px_52px_-32px_rgba(15,23,42,0.28)] backdrop-blur sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0b1426]">Pamiątki i wspomnienia</h2>
              <p className="text-sm text-[#0b1426]/70">
                Dodawaj cytaty, teksty, zdjęcia i miejsca, aby wspólnie tworzyć historię upamiętnionej osoby.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {localEditing ? (
                <button onClick={handleStopEdit} className={SECONDARY_BUTTON}>
                  <EyeIcon className="h-4 w-4" /> Zakończ edycję
                </button>
              ) : (
                <button onClick={handleStartEdit} className={PRIMARY_GRADIENT_BUTTON}>
                  <PencilSquareIcon className="h-4 w-4" /> Edytuj wspomnienia
                </button>
              )}
            </div>
          </div>
          {isSavingOrder && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f6f9fc] px-4 py-1 text-xs font-semibold text-[#0b1426]/60">
              <SparklesIcon className="h-4 w-4 text-cyan-500" /> Zapisywanie zmian kolejności…
            </div>
          )}
        </div>
      )}

      {localEditing && (
        <div className="rounded-[32px] border border-white/60 bg-white/95 px-6 py-8 shadow-[0_20px_52px_-32px_rgba(15,23,42,0.28)] backdrop-blur sm:px-10">
          <h3 className="text-lg font-semibold text-[#0b1426]">Dodaj nowe wspomnienie</h3>
          <p className="text-sm text-[#0b1426]/70">Wybierz typ elementu, aby wzbogacić stronę pamięci o kolejne historie.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {creationButtons.map(({ label, description, icon: Icon, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="group flex flex-col items-start gap-3 rounded-[24px] border border-[#dce4ed] bg-[#f6f9fc] px-5 py-6 text-left transition hover:border-cyan-400 hover:bg-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0b1426]">{label}</p>
                  <p className="text-xs text-[#0b1426]/60">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {visibleMementos.length > 0 ? (
        renderMementoList
      ) : (
        <div className="rounded-[32px] border border-dashed border-[#dce4ed] bg-white/70 px-6 py-16 text-center text-sm text-[#0b1426]/60">
          Nie dodano jeszcze żadnych wspomnień.
        </div>
      )}

      {fullscreenMap && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b1426]/80 backdrop-blur-sm px-4 py-8">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_28px_70px_-40px_rgba(15,23,42,0.45)]">
            <button
              type="button"
              onClick={() => setFullscreenMap(null)}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-[#d4dde5] bg-white px-4 py-1.5 text-xs font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
            >
              Zamknij
            </button>
            <div className="space-y-4 px-6 pt-10 pb-6">
              <h3 className="text-lg font-semibold text-[#0b1426]">{fullscreenMap.content?.title}</h3>
              <p className="text-sm text-[#0b1426]/70">{fullscreenMap.content?.story}</p>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#f6f9fc] px-4 py-1 text-xs font-semibold text-[#0b1426]/60">
                <MapPinIcon className="h-4 w-4 text-cyan-500" />
                {fullscreenMap.content?.address}
              </p>
            </div>
            <div className="h-[420px] border-t border-[#dce4ed]">
              <Map
                initialViewState={{ latitude: fullscreenMap.content?.lat, longitude: fullscreenMap.content?.lng, zoom: 15 }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
              >
                <Marker latitude={fullscreenMap.content?.lat} longitude={fullscreenMap.content?.lng} color="#06b6d4" />
              </Map>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0b1426]/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-white/95 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)]">
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-[#0b1426]">Czy na pewno chcesz usunąć to wspomnienie?</h3>
              <p className="mt-2 text-sm text-[#0b1426]/70">
                Element zostanie trwale usunięty ze strony pamięci. Tego działania nie można cofnąć.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-white/30 bg-white/90 px-6 py-5 sm:flex-row sm:justify-end">
              <button onClick={() => setDeleteModalOpen(false)} className={SECONDARY_BUTTON}>
                Anuluj
              </button>
              <button onClick={handleConfirmDelete} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400">
                <TrashIcon className="h-4 w-4" /> Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddQuoteModalOpen && (
        <AddQuoteModal
          isOpen={isAddQuoteModalOpen}
          onClose={async (newQuote) => {
            setIsAddQuoteModalOpen(false)
            setEditingMemento(null)
            if (newQuote && !editingMemento) {
              setMementos((prev) => [{ ...newQuote, sort_order: 0 }, ...prev])
            } else {
              await fetchMementos()
            }
          }}
          memorialId={memorialId}
          editingQuote={editingMemento}
        />
      )}

      {isAddTextModalOpen && (
        <AddTextModal
          isOpen={isAddTextModalOpen}
          onClose={async (newText) => {
            setIsAddTextModalOpen(false)
            setEditingMemento(null)
            if (newText && !editingMemento) {
              setMementos((prev) => [{ ...newText, sort_order: 0 }, ...prev])
            } else {
              await fetchMementos()
            }
          }}
          memorialId={memorialId}
          editingText={editingMemento}
        />
      )}

      {isAddMapModalOpen && (
        <AddMapModal
          isOpen={isAddMapModalOpen}
          onClose={async (newMap) => {
            setIsAddMapModalOpen(false)
            setEditingMemento(null)
            if (newMap && !editingMemento) {
              setMementos((prev) => [{ ...newMap, sort_order: 0 }, ...prev])
            } else {
              await fetchMementos()
            }
          }}
          memorialId={memorialId}
        />
      )}

      {isAddPhotoModalOpen && (
        <AddPhotoModal
          isOpen={isAddPhotoModalOpen}
          onClose={async () => {
            setIsAddPhotoModalOpen(false)
            setEditingMemento(null)
            await fetchMementos()
          }}
          memorialId={memorialId}
          editingPhoto={editingMemento}
        />
      )}
    </div>
  )
}

export default PamiatkiTab
