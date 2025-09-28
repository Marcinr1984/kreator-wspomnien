'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import KeeperPagesSection from '../../components/KeeperPagesSection'
import type { RealtimeChannel } from '@supabase/supabase-js'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 150,
  minimum: 0.15
})

import { Cog6ToothIcon, PlusIcon, UserCircleIcon, Squares2X2Icon, UsersIcon, HeartIcon, TagIcon } from '@heroicons/react/24/solid'
import StepFormModal from '../../components/StepFormModal'
import TopNavbar from '../../components/TopNavbar'
import DashboardTabs from '../../components/DashboardTabs'

const getUserAndMemorialPages = async (router: any, setUserName: any, setInitials: any, getMemorialPages: any): Promise<RealtimeChannel | null> => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    router.push('/auth/login')
    return null
  }

  const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || data.user.email
  setUserName(name)

  const first = data.user.user_metadata?.first_name || ''
  const last = data.user.user_metadata?.last_name || ''
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  setInitials(initials)
  await getMemorialPages()

  const channel = supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'memorial_pages' },
      async () => {
        await getMemorialPages()
      }
    )
    .subscribe()

  return channel
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>('MR')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memorialPages, setMemorialPages] = useState<any[]>([])
  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const router = useRouter()

  const stats = useMemo(() => {
    const total = memorialPages.length
    const published = memorialPages.filter((page) => page?.is_public).length
    const drafts = total - published
    return {
      total,
      published,
      drafts
    }
  }, [memorialPages])

  const getMemorialPages = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Błąd pobierania użytkownika:', userError)
      return
    }

    const { data, error } = await supabase
      .from('memorial_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Błąd pobierania stron pamięci:', error)
    } else {
      setMemorialPages(data)
    }
  }

  useEffect(() => {
    NProgress.start()
    let isMounted = true

    getUserAndMemorialPages(router, setUserName, setInitials, getMemorialPages)
      .then((channel) => {
        if (isMounted && channel) {
          subscriptionRef.current = channel
        }
      })
      .finally(() => NProgress.done())

    return () => {
      isMounted = false
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3] p-0 m-0">
      {/* Pasek górny */}
      <TopNavbar onCreateMemorialPage={() => setIsModalOpen(true)} />
      <DashboardTabs activePath="/dashboard" />
      <StepFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async () => {
          setIsModalOpen(false)
          const { data, error } = await supabase
            .from('memorial_pages')
            .select('*')
            .order('created_at', { ascending: false })

          if (!error) {
            setMemorialPages(data)
          }
        }}
      />
      <div className="page-fade space-y-8">
      {/* Sekcja hero z powitaniem i statystykami */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 text-white p-8 shadow-[0_30px_60px_-20px_rgba(14,116,144,0.45)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg">
                <UserCircleIcon className="w-10 h-10" />
              </div>
              <div>
                <p className="uppercase text-xs tracking-widest text-white/70">Panel główny</p>
                <h1 className="text-3xl md:text-4xl font-semibold mt-1">Witaj, {userName || 'Użytkowniku'}</h1>
                <p className="text-sm md:text-base text-white/80 mt-2 max-w-xl">
                  Zarządzaj swoimi stronami pamięci, zapraszaj opiekunów i twórz nowe wspomnienia, które będą żyły wiecznie.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
              {[{
                label: 'Strony pamięci',
                value: stats.total
              }, {
                label: 'Publiczne',
                value: stats.published
              }, {
                label: 'Szkice',
                value: stats.drafts
              }].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/15 backdrop-blur px-5 py-4 text-left shadow-inner border border-white/10">
                  <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sekcja akcji */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/profil')}
            className="group bg-white rounded-3xl px-6 py-5 text-left shadow-[0_20px_40px_-28px_rgba(14,116,144,0.45)] border border-white/60 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-white shadow-lg">
                <Cog6ToothIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Ustawienia konta</p>
                <p className="text-xs text-gray-500">Aktualizuj dane i konfiguruj preferencje</p>
              </div>
            </div>
          </button>
          <div className="group bg-white rounded-3xl px-6 py-5 text-left shadow-[0_20px_40px_-28px_rgba(218,70,125,0.4)] border border-white/60 hover:-translate-y-1 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
                <HeartIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Stwórz żywy pomnik</p>
                <p className="text-xs text-gray-500">Poznaj nowe możliwości upamiętniania</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-white rounded-3xl px-6 py-5 text-left shadow-[0_20px_40px_-28px_rgba(14,116,144,0.45)] border border-white/60 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <PlusIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Utwórz stronę pamięci</p>
                <p className="text-xs text-gray-500">Rozpocznij nową historię w kilku krokach</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Sekcja pamięci */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-[28px] shadow-[0_25px_70px_-40px_rgba(15,82,109,0.45)] p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Twoje pamiątki</h2>
              <p className="text-sm text-slate-500 mt-1">Zarządzaj stworzonymi stronami i twórz nowe wspomnienia.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-sm text-slate-700 hover:bg-slate-200 transition"
            >
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              Utwórz nową stronę
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: Math.max(memorialPages.length + 1, 4) }).map((_, i) => {
              const page = memorialPages[i]
              if (!page) {
                return (
                  <button
                    key={`placeholder-${i}`}
                    onClick={() => setIsModalOpen(true)}
                    className="group relative overflow-hidden rounded-3xl border border-dashed border-slate-300/70 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-sm p-8 flex flex-col items-center justify-center gap-3 text-slate-500 hover:-translate-y-1 hover:border-slate-400 transition"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-cyan-50 transition">
                      <PlusIcon className="w-7 h-7 text-cyan-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Nowa strona pamięci</span>
                    <span className="text-xs text-slate-400 text-center max-w-[160px]">
                      Zacznij budować kolejne wspomnienie w kilku prostych krokach.
                    </span>
                  </button>
                )
              }

              return (
                <div
                  key={page.id}
                  className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_-40px_rgba(11,72,107,0.4)] border border-white/70 transition transform hover:-translate-y-1"
                >
                  <button
                    onClick={() => router.push(`/memorial/${page.id}`)}
                    className="flex flex-col w-full text-left"
                  >
                    <div className="relative h-52 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10 z-10" />
                      {page.photo_url ? (
                        <img
                          src={page.photo_url}
                          alt="miniatura"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <Squares2X2Icon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/20 backdrop-blur border border-white/50">
                        {page?.is_public ? 'Publiczna' : 'Szkic'}
                      </div>
                      <div className="absolute bottom-3 left-4 right-4 z-20">
                        <p className="text-lg font-semibold text-white drop-shadow-sm">
                          {[page.first_name, page.last_name].filter(Boolean).join(' ') || 'Strona pamięci'}
                        </p>
                        <p className="text-xs text-white/80">Utworzona {page.created_at?.slice(0, 10) ?? '–'}</p>
                      </div>
                    </div>
                  </button>
                  <div className="px-5 py-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-2 text-slate-600">
                      <TagIcon className="w-4 h-4 text-cyan-500" />
                      #{page.id}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()

                        const { error: keeperDeleteError } = await supabase
                          .from('memorial_keepers')
                          .delete()
                          .eq('memorial_id', page.id)

                        if (keeperDeleteError) {
                          console.error('Błąd podczas usuwania opiekunów:', keeperDeleteError)
                          return
                        }

                        const { error: deletePageError } = await supabase
                          .from('memorial_pages')
                          .delete()
                          .eq('id', page.id)

                        if (deletePageError) {
                          console.error('Błąd podczas usuwania strony pamięci:', deletePageError)
                          return
                        }

                        setMemorialPages(memorialPages.filter((p) => p.id !== page.id))
                      }}
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pb-16">
        <KeeperPagesSection />
      </div>
      </div>
    </div>
  )
}
