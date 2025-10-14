'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { supabase } from '../utils/supabaseClient'
import { VideoCameraIcon } from '@heroicons/react/24/solid'

interface AddVideoModalProps {
  isOpen: boolean
  onClose: (newVideo?: any) => void
  memorialId: number | string
  editingVideo?: any | null
  currentCount: number
  maxVideos: number
}

type VideoSource = 'youtube' | 'vimeo'

type ParsedLink = {
  source: VideoSource
  url: string
  embedUrl: string
}

const parseVideoLink = (value: string): ParsedLink | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const youtubeRegex = /(?:youtube\.com\/(?:[^\n]+?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  const youtubeMatch = trimmed.match(youtubeRegex)
  if (youtubeMatch && youtubeMatch[1]) {
    const id = youtubeMatch[1]
    return {
      source: 'youtube',
      url: trimmed,
      embedUrl: `https://www.youtube.com/embed/${id}`
    }
  }

  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d{6,})/
  const vimeoMatch = trimmed.match(vimeoRegex)
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1]
    return {
      source: 'vimeo',
      url: trimmed,
      embedUrl: `https://player.vimeo.com/video/${id}`
    }
  }

  return null
}

const AddVideoModal = ({
  isOpen,
  onClose,
  memorialId,
  editingVideo,
  currentCount,
  maxVideos
}: AddVideoModalProps) => {
  const isEditing = Boolean(editingVideo)
  const parsedMemorialId = useMemo(() => (typeof memorialId === 'string' ? parseInt(memorialId, 10) : memorialId), [memorialId])

  const [link, setLink] = useState<string>('')
  const [linkInfo, setLinkInfo] = useState<ParsedLink | null>(null)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.content?.title || '')
      setDescription(editingVideo.content?.description || '')
      setLink(editingVideo.content?.url || '')
      if (editingVideo.content?.source === 'youtube' && editingVideo.content?.url) {
        setLinkInfo({
          source: 'youtube',
          url: editingVideo.content.url,
          embedUrl: editingVideo.content?.embedUrl || editingVideo.content.url
        })
      } else if (editingVideo.content?.source === 'vimeo' && editingVideo.content?.url) {
        setLinkInfo({
          source: 'vimeo',
          url: editingVideo.content.url,
          embedUrl: editingVideo.content?.embedUrl || editingVideo.content.url
        })
      } else {
        setLinkInfo(null)
      }
    } else {
      setTitle('')
      setDescription('')
      setLink('')
      setLinkInfo(null)
    }
    setError(null)
  }, [editingVideo, isOpen])

  const validateBeforeSave = () => {
    if (!isEditing && currentCount >= maxVideos) {
      setError(`Możesz dodać maksymalnie ${maxVideos} wideo.`)
      return false
    }

    if (!title.trim()) {
      setError('Nadaj tytuł materiałowi wideo.')
      return false
    }

    const parsed = parseVideoLink(link)
    if (!parsed) {
      setError('Podaj poprawny link YouTube lub Vimeo.')
      return false
    }
    setLinkInfo(parsed)

    setError(null)
    return true
  }

  const handleSave = async () => {
    if (!validateBeforeSave()) return

    setLoading(true)

    try {
      const parsed = linkInfo || parseVideoLink(link)
      if (!parsed) throw new Error('Nie udało się rozpoznać linku wideo.')

      const payload = {
        title: title.trim(),
        description: description.trim(),
        source: parsed.source,
        url: parsed.url,
        embedUrl: parsed.embedUrl,
        path: null
      }

      let result: any = null
      if (editingVideo) {
        const { data, error } = await supabase
          .from('memorial_mementos')
          .update({ content: payload })
          .eq('id', editingVideo.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('memorial_mementos')
          .insert({
            memorial_id: parsedMemorialId,
            type: 'video',
            content: payload
          })
          .select()
          .single()

        if (error || !data) throw error || new Error('Brak danych po dodaniu wideo')
        result = data
      }

      onClose(result)
    } catch (err: any) {
      console.error('Błąd zapisu wideo', err)
      setError(err?.message || 'Nie udało się zapisać materiału wideo. Spróbuj ponownie później.')
    } finally {
      setLoading(false)
    }
  }

  const disabledDueToLimit = !isEditing && currentCount >= maxVideos

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
              <Dialog.Panel className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/95 text-left shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="relative bg-gradient-to-r from-purple-500 via-sky-500 to-cyan-500 px-6 py-6 text-white sm:px-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20">
                        <VideoCameraIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-semibold sm:text-3xl">
                          {isEditing ? 'Edytuj materiał wideo' : 'Dodaj materiał wideo'}
                        </Dialog.Title>
                        <p className="mt-1 max-w-2xl text-sm text-white/85">
                          Wklej link z YouTube lub Vimeo, aby wzbogacić wspomnienia o multimedia.
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={loading}
                      onClick={() => (!loading ? onClose() : undefined)}
                      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>

                <div className="space-y-8 bg-white/95 px-6 py-8 sm:px-10">
                  {disabledDueToLimit && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Osiągnięto limit {maxVideos} materiałów wideo. Usuń istniejący film, aby dodać nowy.
                    </div>
                  )}

                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#0b1426]">Tytuł</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Dodaj krótki tytuł"
                          maxLength={120}
                          className="w-full rounded-2xl border border-[#dce4ed] bg-white/80 px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#0b1426]">Opis (opcjonalnie)</label>
                        <textarea
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          rows={4}
                          maxLength={1000}
                          placeholder="Dodaj kontekst lub historię związaną z nagraniem."
                          className="w-full rounded-2xl border border-[#dce4ed] bg-white/80 px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#0b1426]">Link do filmu</label>
                        <input
                          type="url"
                          value={link}
                          onChange={(event) => setLink(event.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full rounded-2xl border border-[#dce4ed] bg-white/80 px-4 py-3 text-sm text-[#0b1426] placeholder:text-[#0b1426]/40 focus:border-cyan-400 focus:outline-none"
                        />
                        <p className="text-xs text-[#0b1426]/50">Obsługiwane serwisy: YouTube, Vimeo. Wklej pełny adres URL.</p>
                      </div>

                      {error && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                          {error}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40 text-center lg:text-left">
                        Podgląd
                      </div>
                      <div className="rounded-[28px] border border-[#dce4ed] bg-white/90 p-4 shadow-[0_20px_52px_-32px_rgba(14,116,144,0.28)]">
                        <p className="text-sm font-semibold text-[#0b1426] text-center">
                          {title || 'Dodaj tytuł, aby zobaczyć podgląd'}
                        </p>
                        <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-[#dce4ed] bg-[#f6f9fc]">
                          {linkInfo ? (
                            <iframe
                              src={linkInfo.embedUrl}
                              title="Podgląd wideo"
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : editingVideo?.content?.embedUrl ? (
                            <iframe
                              src={editingVideo.content.embedUrl}
                              title="Podgląd wideo"
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-[#0b1426]/40">
                              Wklej link, aby zobaczyć podgląd.
                            </div>
                          )}
                        </div>
                        {description && (
                          <p className="mt-3 text-xs text-[#0b1426]/60">{description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/30 bg-white/90 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                  <button
                    onClick={() => (!loading ? onClose() : undefined)}
                    className="rounded-full border border-[#d4dde5] bg-white px-6 py-2 text-sm font-semibold text-[#0b1426]/70 transition hover:border-[#c6d2dd] hover:bg-[#f5f8fb] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || disabledDueToLimit}
                    className="rounded-full bg-gradient-to-r from-purple-500 via-sky-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/45 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Zapisywanie…' : isEditing ? 'Zapisz zmiany' : 'Dodaj wideo'}
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

export default AddVideoModal
