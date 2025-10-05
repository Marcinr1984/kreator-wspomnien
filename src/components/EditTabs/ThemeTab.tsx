'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { PhotoIcon, ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

const BANNER_BUCKET = 'memorial-banners'

interface ThemeTabProps {
  memorialId: number
  currentBannerUrl?: string | null
  onBannerChange?: (newUrl: string) => Promise<void> | void
}

interface StoredBackground {
  path: string
  url: string
  name: string
}

const ThemeTab = ({ memorialId, currentBannerUrl, onBannerChange }: ThemeTabProps) => {
  const [sharedBackgrounds, setSharedBackgrounds] = useState<StoredBackground[]>([])
  const [userBackgrounds, setUserBackgrounds] = useState<StoredBackground[]>([])
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>(currentBannerUrl || undefined)
  const [initialBannerUrl, setInitialBannerUrl] = useState<string | undefined>(currentBannerUrl || undefined)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingSelection, setPendingSelection] = useState<string | null>(null)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)

  useEffect(() => {
    setSelectedUrl(currentBannerUrl || undefined)
    setInitialBannerUrl(currentBannerUrl || undefined)
  }, [currentBannerUrl])

  const getPublicUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }, [])

  const listBackgrounds = useCallback(async (prefix: string) => {
    const fetchRecursive = async (target: string): Promise<StoredBackground[]> => {
      const normalized = target ? target.replace(/\/+$/,'') : ''
      const listPath = normalized === '' ? undefined : normalized

      const { data, error } = await supabase.storage.from(BANNER_BUCKET).list(listPath, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

      if (error) {
        console.warn('Błąd pobierania grafik tła', error.message)
        return []
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('ThemeTab:list', normalized || '(root)', data)
      }

      let collected: StoredBackground[] = []

      for (const item of data || []) {
        if (!item?.name) continue
        const pathBase = normalized ? `${normalized}/${item.name}` : item.name

        if (item.type === 'folder') {
          const nested = await fetchRecursive(pathBase)
          collected = collected.concat(nested)
        } else {
          collected.push({
            path: pathBase,
            url: getPublicUrl(pathBase),
            name: item.name
          })
        }
      }

      return collected
    }

    return fetchRecursive(prefix)
  }, [getPublicUrl])

  const loadBackgrounds = useCallback(async () => {
    setLoading(true)
    setError(null)

    let shared: StoredBackground[] = []
    let personal: StoredBackground[] = []

    try {
      shared = await listBackgrounds('shared')
      if (userId) {
        personal = await listBackgrounds(`users/${userId}`)
      }
    } catch (err: any) {
      setError('Nie udało się pobrać motywów. Spróbuj ponownie później.')
      console.error(err)
    } finally {
      setSharedBackgrounds(shared)
      setUserBackgrounds(personal)
      setLoading(false)
    }

    return { shared, personal }
  }, [listBackgrounds, userId])

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.warn('Nie udało się pobrać użytkownika', error.message)
      }
      setUserId(data?.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    loadBackgrounds()
  }, [loadBackgrounds])

  const handleSelect = async (url: string) => {
    if (!onBannerChange) {
      setSelectedUrl(url)
      return
    }
    try {
      setPendingSelection(url)
      await onBannerChange(url)
      setSelectedUrl(url)
    } catch (err: any) {
      console.error('Błąd ustawiania tła', err)
      setError('Nie udało się zaktualizować tła. Spróbuj ponownie później.')
      setSelectedUrl(initialBannerUrl)
    } finally {
      setPendingSelection(null)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    if (userBackgrounds.length >= 3) {
      setError('Możesz przechowywać maksymalnie 3 własne tła. Usuń jedno, aby dodać nowe.')
      event.target.value = ''
      return
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      setError('Plik jest zbyt duży. Dozwolone są obrazy do 5 MB.')
      event.target.value = ''
      return
    }

    setUploading(true)
    setError(null)

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase()
      const path = `users/${userId}/${Date.now()}-${sanitizedName}`
      const { error: uploadError } = await supabase.storage
        .from(BANNER_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        throw uploadError
      }

      await loadBackgrounds()
      const publicUrl = getPublicUrl(path)
      await handleSelect(publicUrl)
    } catch (err: any) {
      console.error('Błąd podczas przesyłania tła', err)
      setError('Wgrywanie nie powiodło się. Spróbuj ponownie później.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteBackground = async (background: StoredBackground) => {
    if (!userId || !background.path.startsWith(`users/${userId}`)) {
      return
    }

    try {
      setDeletingPath(background.path)
      const { error } = await supabase.storage.from(BANNER_BUCKET).remove([background.path])
      if (error) {
        throw error
      }

      const { shared, personal } = await loadBackgrounds()

      if (selectedUrl === background.url) {
        const fallback = [...personal, ...shared].find((item) => item.url !== background.url)

        if (fallback) {
          await handleSelect(fallback.url)
        } else if (initialBannerUrl && initialBannerUrl !== background.url) {
          await handleSelect(initialBannerUrl)
        } else if (onBannerChange) {
          await onBannerChange('')
          setSelectedUrl(undefined)
        } else {
          setSelectedUrl(undefined)
        }
      }
    } catch (err: any) {
      console.error('Błąd usuwania tła', err)
      setError('Nie udało się usunąć tła. Spróbuj ponownie później.')
    } finally {
      setDeletingPath(null)
    }
  }

  const BannerGrid = ({
    title,
    items,
    allowDelete = false,
    onDelete,
    pendingUrl,
    deleting
  }: {
    title: string
    items: StoredBackground[]
    allowDelete?: boolean
    onDelete?: (background: StoredBackground) => void
    pendingUrl?: string | null
    deleting?: string | null
  }) => {
    if (!items.length) return null

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40">{title}</h4>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((background) => {
            const isActive = selectedUrl === background.url
            const isPending = pendingUrl === background.url
            const isDeleting = deleting === background.path
            return (
              <div key={background.path} className="relative">
                <button
                  type="button"
                  onClick={() => handleSelect(background.url)}
                  disabled={isPending || isDeleting}
                  className={`group relative w-full overflow-hidden rounded-[24px] border ${
                    isActive ? 'border-cyan-400 shadow-[0_16px_40px_-26px_rgba(14,116,144,0.45)]' : 'border-[#dce4ed] shadow-[0_12px_34px_-26px_rgba(15,23,42,0.2)]'
                  } bg-[#f6f9fc] transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div
                    className="h-32 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${background.url})` }}
                  />
                  <div
                    className={`pointer-events-none absolute inset-x-3 bottom-3 flex justify-center transition-all duration-200 ease-out ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center rounded-full border px-5 py-1.5 text-[13px] font-semibold leading-none backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${
                        isActive
                          ? 'border-white/40 bg-gradient-to-r from-white/85 via-white/60 to-white/25 text-[#0b1426]'
                          : 'border-white/30 bg-gradient-to-r from-white/60 via-white/35 to-white/18 text-[#0b1426]/80'
                      }`}
                    >
                      {isPending ? 'Ustawianie…' : isActive ? 'Aktywne' : 'Ustaw tło'}
                    </div>
                  </div>
                </button>
                {allowDelete && onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(background)
                    }}
                    disabled={isDeleting || isPending}
                    className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-[15px] font-semibold leading-none text-rose-500 shadow-[0_6px_18px_-10px_rgba(225,29,72,0.4)] transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isDeleting ? 'animate-pulse' : ''
                    }`}
                  >
                    {isDeleting ? '…' : '×'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const uploadDisabled = !userId || uploading

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-[#dce4ed] bg-white/90 p-6 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.28)]">
        <h3 className="text-lg font-semibold text-[#0b1426]">Wybierz tło strony</h3>
        <p className="text-sm text-[#0b1426]/70">
          Skorzystaj z gotowych motywów lub wgraj własne zdjęcia, aby dopasować stronę pamięci do charakteru bliskiej osoby.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f6f9fc] px-4 py-1 text-xs font-semibold text-[#0b1426]/60">
          <ArrowPathIcon className="h-4 w-4 text-cyan-500" />
          Aktualne tło jest podświetlone.
        </div>
      </div>

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center rounded-[28px] border border-[#dce4ed] bg-white/90 p-10 text-sm text-[#0b1426]/60 shadow-[0_12px_34px_-26px_rgba(15,23,42,0.2)]">
          Wczytywanie motywów…
        </div>
      ) : (
        <div className="space-y-10">
          <BannerGrid title="Galeria publiczna" items={sharedBackgrounds} pendingUrl={pendingSelection} deleting={deletingPath} />
          {userId && (
            <BannerGrid
              title="Twoje przesłane tła"
              items={userBackgrounds}
              allowDelete
              onDelete={handleDeleteBackground}
              pendingUrl={pendingSelection}
              deleting={deletingPath}
            />
          )}
        </div>
      )}

      <div className="rounded-[28px] border border-dashed border-[#dce4ed] bg-white/70 p-6 text-center shadow-[0_12px_34px_-26px_rgba(15,23,42,0.2)]">
        <h4 className="text-sm font-semibold text-[#0b1426]">Prześlij nowe tło</h4>
        <p className="mt-1 text-xs text-[#0b1426]/60">Możesz przesłać pliki JPG, PNG lub WebP do 5 MB.</p>
        <div className="mt-4 flex flex-col items-center gap-3">
          <label
            className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 ${
              uploadDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            }`}
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            {uploading ? 'Wgrywanie…' : 'Dodaj własne tło'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={uploadDisabled}
              onChange={handleUpload}
            />
          </label>
          {!userId && (
            <p className="text-xs text-[#0b1426]/50">Zaloguj się ponownie, aby dodawać własne motywy.</p>
          )}
        </div>
      </div>

      {pendingSelection && (
        <div className="text-xs text-[#0b1426]/60">Ustawianie wybranego tła…</div>
      )}
    </div>
  )
}

export default ThemeTab
