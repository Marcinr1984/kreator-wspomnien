'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useRef, useEffect } from 'react'
import ImageCropper from './ImageCropper'
import { createClient } from '@supabase/supabase-js'
import { PhotoIcon } from '@heroicons/react/24/solid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AddPhotoModalProps {
  isOpen: boolean
  onClose: (newPhoto?: any) => void
  memorialId: string | number
  editingPhoto?: any | null
}

export default function AddPhotoModal({ isOpen, onClose, memorialId, editingPhoto }: AddPhotoModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [layout, setLayout] = useState<'left' | 'right'>('right')
  const [file, setFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const cropperRef = useRef<any>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [editablePhotoUrl, setEditablePhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (editingPhoto) {
      const { title, date, description, layout, image_url } = editingPhoto.content || {}
      setTitle(title || '')
      setDate(date || '')
      setDescription(description || '')
      setLayout(layout || 'right')

      if (image_url) {
        fetch(image_url)
          .then(res => res.blob())
          .then(blob => {
            const fetchedFile = new File([blob], `photo-from-db-${Date.now()}.jpeg`, { type: blob.type })
            setFile(fetchedFile)
            setEditablePhotoUrl(URL.createObjectURL(fetchedFile))
            setIsCropping(false)
            setIsEditing(false)
          })
      } else {
        setFile(null)
      }
    } else {
      setTitle('')
      setDate('')
      setDescription('')
      setLayout('right')
      setFile(null)
      setEditablePhotoUrl(null)
      setIsCropping(false)
      setIsEditing(false)
    }
  }, [editingPhoto])

  useEffect(() => {
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setEditablePhotoUrl(localUrl)
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setEditablePhotoUrl(URL.createObjectURL(selected))
      setIsCropping(true)
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Wpisz tytuł zdjęcia.')
      return
    }

    setLoading(true)

    let image_url = editingPhoto?.content?.image_url ?? null
    let image_path = editingPhoto?.content?.image_path ?? null

    if (editingPhoto?.content?.image_path && file) {
      await supabase.storage.from('memorial-photos').remove([editingPhoto.content.image_path])
    }

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${memorialId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(fileName, file)

      if (uploadError) {
        alert('Błąd podczas przesyłania zdjęcia.')
        console.error(uploadError)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('memorial-photos').getPublicUrl(fileName)
      image_url = publicUrlData.publicUrl
      image_path = fileName
    }

    const parsedId = typeof memorialId === 'string' ? parseInt(memorialId) : memorialId

    if (editingPhoto) {
      const { error } = await supabase
        .from('memorial_mementos')
        .update({
          content: {
            title,
            date,
            description,
            layout,
            image_url,
            image_path,
          }
        })
        .eq('id', editingPhoto.id)

      if (error) {
        alert('Błąd podczas aktualizacji zdjęcia.')
        console.error(error)
        setLoading(false)
        return
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('memorial_mementos')
        .insert({
          memorial_id: parsedId,
          type: 'photo',
          content: {
            title,
            date,
            description,
            layout,
            image_url,
            image_path,
          },
        })
        .select()
        .single()

      if (error || !inserted) {
        alert('Błąd podczas zapisywania zdjęcia.')
        console.error(error)
        setLoading(false)
        return
      } else {
        setLoading(false)
        onClose(inserted)
        return
      }
    }

    setLoading(false)
    onClose()
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
              <Dialog.Panel className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20">
                        <PhotoIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-semibold sm:text-3xl">Dodaj zdjęcie</Dialog.Title>
                        <p className="mt-1 max-w-xl text-sm text-white/85">Wybierz zdjęcie, opisz jego kontekst i zdecyduj, jak ma zostać wyświetlone na stronie pamięci.</p>
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

                <div className="bg-white/95 px-6 py-8 sm:px-10">
                  {isEditing && editablePhotoUrl ? (
                    <div className="flex flex-col items-center gap-6">
                      <p className="text-sm font-semibold text-[#0b1426]">Przytnij zdjęcie, aby idealnie pasowało.</p>
                      <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-[#dde5ec] shadow-[0_22px_55px_-38px_rgba(15,23,42,0.28)]">
                        {isCropping && (
                          <ImageCropper
                            ref={cropperRef}
                            imageUrl={editablePhotoUrl}
                            onCropComplete={(blob: Blob) => {
                              const cropped = new File([blob], `photo-${Date.now()}.jpeg`, { type: 'image/jpeg' });
                              setFile(cropped)
                              setIsCropping(false)
                              setIsEditing(false)
                            }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
                        >
                          Anuluj przycinanie
                        </button>
                        <button
                          onClick={async () => {
                            if (cropperRef.current?.getCroppedImage) {
                              const blob = await cropperRef.current.getCroppedImage()
                              if (blob) {
                                const cropped = new File([blob], `photo-${Date.now()}.jpeg`, { type: 'image/jpeg' })
                                setFile(cropped)
                              }
                            }
                            setIsCropping(false)
                            setIsEditing(false)
                          }}
                          className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45"
                        >
                          Zapisz przycięcie
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-[#0b1426]">Szczegóły</h3>
                          <p className="text-sm text-[#0b1426]/70">Dodaj opis zdjęcia i wybierz układ, w jakim ma się pojawiać w historii.</p>
                        </div>
                        <div className="rounded-[28px] border border-[#dde5ec] bg-white/90 p-6 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.28)] space-y-6">
                          <div className="rounded-[24px] border-2 border-dashed border-[#dce4ed] bg-[#f6f9fc] px-6 py-8 text-center">
                            {file ? (
                              <div className="space-y-4">
                                <img src={URL.createObjectURL(file)} alt="Podgląd" className="mx-auto h-32 w-32 rounded-2xl object-cover shadow" />
                                <div className="flex flex-wrap justify-center gap-3">
                                  <button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-full border border-[#d4dde5] bg-white px-4 py-2 text-xs font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb]"
                                  >
                                    Przytnij ponownie
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFile(null)
                                      setEditablePhotoUrl(null)
                                      setIsCropping(false)
                                    }}
                                    className="rounded-full border border-[#f1b1c3] bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                                  >
                                    Usuń zdjęcie
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <input id="upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                <label
                                  htmlFor="upload"
                                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 cursor-pointer"
                                >
                                  <PhotoIcon className="h-5 w-5" /> Dodaj plik
                                </label>
                                <p className="text-xs text-[#0b1426]/50">Obsługujemy formaty JPG, PNG i WebP. Maksymalny rozmiar 10 MB.</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-[#0b1426] mb-2">Tytuł zdjęcia *</label>
                              <input
                                type="text"
                                className="w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nadaj zdjęciu nazwę"
                                required
                              />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="block text-sm font-semibold text-[#0b1426] mb-2">Data (opcjonalnie)</label>
                                <input
                                  type="date"
                                  className="w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426]/80 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                  value={date}
                                  onChange={(e) => setDate(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-[#0b1426] mb-2">Układ</label>
                                <div className="flex gap-2">
                                  {(['left', 'right'] as const).map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => setLayout(option)}
                                      className={`flex-1 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                                        layout === option ? 'border-cyan-400 bg-cyan-50 text-cyan-600' : 'border-[#dce4ed] bg-white text-[#0b1426]/50'
                                      }`}
                                    >
                                      {option === 'left' ? 'Zdjęcie po lewej' : 'Zdjęcie po prawej'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#0b1426] mb-2">Opis</label>
                              <textarea
                                className="min-h-[120px] w-full rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] px-4 py-3 text-sm text-[#0b1426]/80 placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Opisz kontekst i znaczenie zdjęcia."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40 text-center lg:text-left">Podgląd</div>
                        <div className="rounded-[28px] border border-[#dce4ed] bg-white/90 p-6 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.28)]">
                          <div className={`flex flex-col gap-4 ${layout === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:items-start`}>
                            <div className="mx-auto flex h-40 w-full max-w-[180px] items-center justify-center overflow-hidden rounded-2xl border border-[#dce4ed] bg-[#f6f9fc] lg:mx-0">
                              {file ? (
                                <img src={URL.createObjectURL(file)} alt="Podgląd" className="h-full w-full object-cover" />
                              ) : (
                                <PhotoIcon className="h-12 w-12 text-[#0b1426]/30" />
                              )}
                            </div>
                            <div className="space-y-2 text-sm text-[#0b1426]/70 lg:max-w-[240px]">
                              <p className="text-xs text-[#0b1426]/40">{date ? new Date(date).toLocaleDateString('pl-PL') : 'Data nieznana'}</p>
                              <h4 className="text-base font-semibold text-[#0b1426]">{title || 'Tytuł zdjęcia'}</h4>
                              <p className="leading-relaxed whitespace-pre-wrap">
                                {description || 'Twój opis pojawi się tutaj po wpisaniu treści.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    disabled={!title.trim() || loading}
                    className={`rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 ${
                      !title.trim() || loading ? 'cursor-not-allowed opacity-70' : ''
                    }`}
                  >
                    {loading ? 'Zapisywanie…' : 'Zapisz zdjęcie'}
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
