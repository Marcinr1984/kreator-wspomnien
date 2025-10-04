'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'
import PamiatkiTab from '../../../components/MemorialTab/PamiatkiTab'
import { CalendarIcon, GlobeAltIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/solid'

export default function PublicMemorialView() {
  const client = supabase;
  const [data, setData] = useState<any>(null);
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (!id) return;
    client
      .from('memorial_pages')
      .select('*')
      .eq('id', id)
      .single()
      .then((res) => {
        console.log('ODP Z SUPABASE:', res);
        const { data, error } = res;

        if (error || !data) {
          console.error('Błąd lub brak danych:', error);
          setData(null);
        } else {
          setData(data);
        }
      });
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3] flex items-center justify-center px-6">
        <div className="max-w-md rounded-[32px] border border-white/60 bg-white/90 p-8 text-center shadow-[0_30px_60px_-32px_rgba(14,116,144,0.35)] backdrop-blur">
          <h1 className="text-xl font-semibold text-[#0b1426]">Nie znaleziono strony pamięci</h1>
          <p className="mt-3 text-sm text-[#0b1426]/70">Sprawdź poprawność linku lub skontaktuj się z opiekunem strony.</p>
        </div>
      </div>
    )
  }

  const parsedId = data?.id

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const candidate = new Date(value)
    if (Number.isNaN(candidate.getTime())) {
      return value
    }
    return candidate.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const birthDateLabel = formatDate(data?.birth_date) || 'Data urodzenia nieznana'
  const deathDateLabel = data?.death_date ? formatDate(data.death_date) : 'Obecnie'
  const StatusIcon = data?.is_public ? GlobeAltIcon : SparklesIcon
  const statusLabel = data?.is_public ? 'Strona publiczna' : 'Strona w przygotowaniu'
  const heroDescription = data?.short_description || data?.summary || ''
  const relationLabel = data?.relation || data?.relations || ''

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3] pb-16 text-[#0b1426]">
      <div className="relative">
        <div className="group relative h-[360px] sm:h-[400px] lg:h-[440px] overflow-hidden isolate">
          <img
            src={data.banner_url || '/banner1.jpg'}
            alt="Baner strony pamięci"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: typeof data.banner_position === 'string' ? data.banner_position : '50% 50%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#ecf2f6] via-[#ecf2f6]/70 to-transparent" />
          <div className="absolute inset-x-6 top-8 z-20 flex flex-col gap-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold backdrop-blur-sm">
              <StatusIcon className="h-5 w-5 text-white" />
              <span>{statusLabel}</span>
            </div>
            <p className="max-w-xl text-sm text-white/80">
              {data.is_public
                ? 'Ta strona pamięci jest dostępna publicznie. Podziel się linkiem, aby bliscy mogli wspominać razem.'
                : 'Strona nie została jeszcze opublikowana. Udostępnij ją tylko zaufanym osobom.'}
            </p>
          </div>
        </div>

        <div className="relative z-20 -mt-24 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-10">
              <div className="space-y-6">
                <div className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white/90 shadow-[0_30px_60px_-32px_rgba(14,116,144,0.35)] backdrop-blur">
                  {data.photo_url ? (
                    <img src={data.photo_url} alt={`${data.first_name} ${data.last_name}`} className="h-[360px] w-full object-cover" />
                  ) : (
                    <div className="flex h-[360px] w-full items-center justify-center bg-[#f6f9fc] text-[#0b1426]/40">
                      Brak zdjęcia
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-1 text-xs font-semibold text-[#0b1426]/70 shadow">Upamiętniona osoba</div>
                </div>

                <div className="space-y-4 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)]">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40">Informacje</h2>
                  <div className="space-y-3 text-sm text-[#0b1426]/70">
                    <p className="flex items-center gap-3"><CalendarIcon className="h-5 w-5 text-cyan-500" /><span>{birthDateLabel} — {deathDateLabel}</span></p>
                    {relationLabel && (
                      <p className="flex items-center gap-3"><SparklesIcon className="h-5 w-5 text-cyan-500" /><span>Relacja: {relationLabel}</span></p>
                    )}
                    {data.city && (
                      <p className="flex items-center gap-3"><MapPinIcon className="h-5 w-5 text-cyan-500" /><span>{data.city}</span></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 p-8 text-white shadow-[0_30px_60px_-20px_rgba(14,116,144,0.45)]">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Upamiętniona osoba</p>
                      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                        {data.first_name} {data.last_name}
                      </h1>
                      <p className="mt-2 text-sm font-medium text-white/80">
                        {birthDateLabel} – {deathDateLabel}
                      </p>
                      {heroDescription && (
                        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/85">
                          {heroDescription}
                        </p>
                      )}
                    </div>
                    <div className="inline-flex h-12 items-center gap-3 rounded-full bg-white/20 px-5 text-sm font-semibold text-white">
                      <GlobeAltIcon className="h-5 w-5" />
                      Strona pamięci
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/90 shadow-[0_30px_60px_-28px_rgba(14,116,144,0.35)] backdrop-blur">
                  <div className="px-6 pt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#0b1426]/40">Pamiątki</div>
                  <div className="px-0 pb-8 pt-2">
                    <PamiatkiTab memorialId={parsedId} isEditing={false} setIsEditing={() => {}} isPublicView={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-[#0b1426]/40">
        © {new Date().getFullYear()} DlaBliskich. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  )
}
