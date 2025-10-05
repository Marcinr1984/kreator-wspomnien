'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Squares2X2Icon, SwatchIcon, RectangleGroupIcon, ArrowsRightLeftIcon, PhotoIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const AVAILABLE_LAYOUTS = ['grid', 'masonry', 'polaroid', 'circle'] as const
type GalleryLayout = (typeof AVAILABLE_LAYOUTS)[number]

type GalleryImageEntry = {
  id: string
  file?: File | null
  previewUrl: string
  caption: string
  existingUrl?: string
  existingPath?: string | null
}

interface AddGalleryModalProps {
  isOpen: boolean
  onClose: (newGallery?: any) => void
  memorialId: number | string
  editingGallery?: any | null
}

const layoutOptions: Array<{
  id: GalleryLayout
  label: string
  description: string
  icon: typeof Squares2X2Icon
}> = [
  {
    id: 'grid',
    label: 'Siatka',
    description: 'Równe kafelki zdjęć w harmonijnej siatce.',
    icon: Squares2X2Icon
  },
  {
    id: 'masonry',
    label: 'Mozaika',
    description: 'Asymetryczny układ o zmiennej wysokości kafelków.',
    icon: SwatchIcon
  },
  {
    id: 'polaroid',
    label: 'Polaroidy',
    description: 'Zdjęcia w białych ramkach z lekkim przechyleniem.',
    icon: RectangleGroupIcon
  },
  {
    id: 'circle',
    label: 'Koła',
    description: 'Minimalistyczna siatka okrągłych miniatur.',
    icon: ArrowsRightLeftIcon
  }
]

const randomId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

const LayoutPreview = ({ layout }: { layout: GalleryLayout }) => {
  switch (layout) {
    case 'polaroid':
      return (
        <div className="grid h-20 w-full grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className={`relative flex h-full items-end justify-center bg-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/60 transition ${
                ['-rotate-3', 'rotate-2', '-rotate-1'][item]
              }`}
            >
              <div className="absolute inset-2 top-2 bg-gradient-to-br from-cyan-400/40 via-sky-300/30 to-purple-400/25" />
              <div className="relative flex h-[65%] w-[70%] flex-col items-center justify-end">
                <div className="h-full w-full bg-white/60" />
                <div className="mt-[6px] h-[14%] w-4 bg-[#0b1426]/10" />
              </div>
            </div>
          ))}
        </div>
      )
    case 'masonry':
      return (
        <div className="flex h-20 w-full gap-1">
          <div className="flex h-full flex-1 flex-col gap-1">
            <div className="h-2/3 rounded-xl bg-gradient-to-br from-cyan-400/50 via-sky-400/40 to-purple-400/30" />
            <div className="h-1/3 rounded-xl bg-gradient-to-br from-emerald-400/40 via-teal-300/30 to-cyan-300/30" />
          </div>
          <div className="flex h-full flex-1 flex-col gap-1">
            <div className="h-1/3 rounded-xl bg-gradient-to-br from-purple-400/40 via-rose-300/40 to-amber-200/30" />
            <div className="h-2/3 rounded-xl bg-gradient-to-br from-blue-400/40 via-sky-300/30 to-indigo-300/30" />
          </div>
          <div className="flex h-full flex-1 flex-col gap-1">
            <div className="h-1/2 rounded-xl bg-gradient-to-br from-indigo-400/40 via-violet-300/30 to-purple-300/30" />
            <div className="h-1/2 rounded-xl bg-gradient-to-br from-teal-400/40 via-cyan-300/30 to-sky-300/30" />
          </div>
        </div>
      )
    case 'circle':
      return (
        <div className="flex h-20 w-full items-center justify-between gap-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400/45 via-sky-300/35 to-purple-400/30 shadow-[0_10px_18px_-16px_rgba(15,23,42,0.35)]"
            />
          ))}
        </div>
      )
    default:
      return (
        <div className="grid h-20 w-full grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-gradient-to-br from-cyan-400/40 via-sky-300/30 to-purple-400/30"
            />
          ))}
        </div>
      )
  }
}

export default function AddGalleryModal({ isOpen, onClose, memorialId, editingGallery }: AddGalleryModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [layout, setLayout] = useState<GalleryLayout>('grid')
  const [images, setImages] = useState<GalleryImageEntry[]>([])
  const [removedPaths, setRemovedPaths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editingGallery?.content) {
      const { title, description, layout, images } = editingGallery.content
      setTitle(title || '')
      setDescription(description || '')
      const normalizedLayout = AVAILABLE_LAYOUTS.includes(layout as GalleryLayout)
        ? (layout as GalleryLayout)
        : layout === 'spotlight'
          ? 'polaroid'
          : layout === 'carousel'
            ? 'circle'
            : 'grid'
      setLayout(normalizedLayout)
      const mapped = (images || []).map((img: any) => ({
        id: randomId(),
        previewUrl: img.url,
        caption: img.caption || '',
        existingUrl: img.url,
        existingPath: img.path || null
      }))
      setImages(mapped)
      setRemovedPaths([])
    } else {
      setTitle('')
      setDescription('')
      setLayout('grid')
      setImages([])
      setRemovedPaths([])
    }
  }, [editingGallery])

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newEntries: GalleryImageEntry[] = Array.from(files).map((file) => ({
      id: randomId(),
      file,
      previewUrl: URL.createObjectURL(file),
      caption: ''
    }))

    setImages((prev) => [...prev, ...newEntries])
    event.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const entry = prev.find((item) => item.id === id)
      if (entry?.existingPath) {
        setRemovedPaths((paths) => [...paths, entry.existingPath as string])
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const moveImage = (index: number, direction: number) => {
    setImages((prev) => {
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= prev.length) return prev
      const copy = [...prev]
      const [moved] = copy.splice(index, 1)
      copy.splice(newIndex, 0, moved)
      return copy
    })
  }

  const updateCaption = (id: string, caption: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)))
  }

  const parsedMemorialId = useMemo(() => (typeof memorialId === 'string' ? parseInt(memorialId, 10) : memorialId), [memorialId])

  const handleSave = async () => {
    if (!images.length) {
      setError('Dodaj co najmniej jedno zdjęcie do galerii.')
      return
    }

    setLoading(true)
    setError(null)

    const payloadImages: Array<{ url: string; path: string | null; caption: string }> = []
    const cleanupPaths = [...removedPaths]

    let createdEntry: any | null = null

    try {
      for (const image of images) {
        let url = image.existingUrl || image.previewUrl
        let path = image.existingPath || null

        if (image.file) {
          const extension = image.file.name.split('.').pop() || 'jpg'
          const fileName = `gallery/${parsedMemorialId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`
          const { error: uploadError } = await supabase.storage.from('memorial-photos').upload(fileName, image.file, {
            cacheControl: '3600',
            upsert: false
          })

          if (uploadError) {
            throw uploadError
          }

          const { data: publicUrlData } = supabase.storage.from('memorial-photos').getPublicUrl(fileName)
          url = publicUrlData.publicUrl
          path = fileName

          if (image.existingPath) {
            cleanupPaths.push(image.existingPath)
          }
        }

        payloadImages.push({ url, path, caption: image.caption })
      }

      if (editingGallery) {
        const { error: updateError } = await supabase
          .from('memorial_mementos')
          .update({
            content: {
              title,
              description,
              layout,
              images: payloadImages
            }
          })
          .eq('id', editingGallery.id)

        if (updateError) {
          throw updateError
        }
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('memorial_mementos')
          .insert({
            memorial_id: parsedMemorialId,
            type: 'gallery',
            content: {
              title,
              description,
              layout,
              images: payloadImages
            }
          })
          .select()
          .single()

        if (insertError || !inserted) {
          throw insertError
        }

        createdEntry = inserted
      }

      if (cleanupPaths.length) {
        await supabase.storage.from('memorial-photos').remove(cleanupPaths)
      }

      if (createdEntry) {
        onClose(createdEntry)
      } else {
        onClose()
      }
    } catch (err: any) {
      console.error('Błąd zapisu galerii', err)
      setError('Nie udało się zapisać galerii. Spróbuj ponownie później.')
    } finally {
      setLoading(false)
    }
  }

  const hasImages = images.length > 0

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={() => (!loading ? onClose() : undefined)}>
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
              <Dialog.Panel className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20">
                        <Squares2X2Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-semibold">
                          {editingGallery ? 'Edytuj galerię zdjęć' : 'Dodaj galerię zdjęć'}
                        </Dialog.Title>
                        <p className="text-sm text-white/80">
                          Łącz wiele fotografii w nowoczesny układ i wybierz styl prezentacji, który najlepiej odda wspomnienia.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => (!loading ? onClose() : undefined)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-white/20"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8 px-6 pb-8 pt-6 sm:px-8">
                  <div className="grid gap-6 lg:grid-cols-[320px,1fr] lg:items-start">
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs uppercase tracking-[0.35em] text-[#0b1426]/40">Tytuł galerii</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Dodaj nagłówek (opcjonalnie)"
                          className="mt-2 w-full rounded-2xl border border-[#dce4ed] bg-white/80 px-4 py-3 text-sm text-[#0b1426] shadow-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.35em] text-[#0b1426]/40">Opis</label>
                        <textarea
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          placeholder="Podziel się historią lub kontekstem zdjęć (opcjonalnie)."
                          rows={5}
                          className="mt-2 w-full resize-none rounded-2xl border border-[#dce4ed] bg-white/80 px-4 py-3 text-sm text-[#0b1426] shadow-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#0b1426]">Wybierz układ galerii</h4>
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40">Styl prezentacji</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {layoutOptions.map(({ id, label, description, icon: Icon }) => {
                          const active = layout === id
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setLayout(id)}
                              className={`group flex flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                                active
                                  ? 'border-cyan-400 bg-white shadow-[0_16px_40px_-30px_rgba(14,116,144,0.55)]'
                                  : 'border-[#dce4ed] bg-[#f6f9fc] hover:border-cyan-400 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30 ${
                                    active ? '' : 'opacity-80'
                                  }`}
                                >
                                  <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-[#0b1426]">{label}</p>
                                  <p className="text-xs text-[#0b1426]/60">{description}</p>
                                </div>
                              </div>
                              <div className="overflow-hidden rounded-xl border border-dashed border-white/40 bg-white/60">
                                <LayoutPreview layout={id} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-[#0b1426]">Zdjęcia w galerii</h4>
                        <p className="text-xs text-[#0b1426]/60">Dodaj kilka fotografii jednocześnie i uporządkuj ich kolejność.</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleFilesSelected}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45"
                        >
                          <PlusIcon className="h-4 w-4" /> Dodaj zdjęcia
                        </button>
                      </div>
                    </div>

                    {hasImages ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative flex flex-col gap-3 rounded-3xl border border-[#dce4ed] bg-white/80 p-4 shadow-[0_20px_52px_-32px_rgba(14,116,144,0.24)]"
                          >
                            <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#dce4ed] bg-[#f6f9fc]">
                              <img src={image.previewUrl} alt="Podgląd" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#0b1426]/70 shadow-lg transition hover:bg-white"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                            <div>
                              <label className="text-xs uppercase tracking-[0.3em] text-[#0b1426]/40">Podpis</label>
                              <input
                                type="text"
                                value={image.caption}
                                onChange={(event) => updateCaption(image.id, event.target.value)}
                                placeholder="Dodaj krótki opis (opcjonalnie)"
                                className="mt-2 w-full rounded-xl border border-[#dce4ed] bg-white px-3 py-2 text-sm text-[#0b1426] focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#0b1426]/50">
                              <span>Kolejność: {index + 1}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, -1)}
                                  disabled={index === 0}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dce4ed] bg-white text-[#0b1426]/60 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <ArrowUpIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 1)}
                                  disabled={index === images.length - 1}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dce4ed] bg-white text-[#0b1426]/60 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <ArrowDownIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#dce4ed] bg-white/70 px-6 py-16 text-center text-sm text-[#0b1426]/60">
                        <PhotoIcon className="h-10 w-10 text-cyan-400" />
                        <p>Dodaj kilka zdjęć, aby rozpocząć tworzenie galerii.</p>
                      </div>
                    )}

                    {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</div>}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/20 bg-white/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <p className="text-xs text-[#0b1426]/50">
                    Układ galerii i kolejność zdjęć można zmieniać w dowolnym momencie.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => (!loading ? onClose() : undefined)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
                    >
                      Anuluj
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-7 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Zapisywanie…' : editingGallery ? 'Zapisz zmiany' : 'Dodaj galerię'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
