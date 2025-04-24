'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import KeeperPagesSection from '../../components/KeeperPagesSection'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 150,
  minimum: 0.15
})

import { Cog6ToothIcon, PlusIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Squares2X2Icon, QuestionMarkCircleIcon, UsersIcon, HeartIcon, DocumentTextIcon, BriefcaseIcon, TagIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import StepFormModal from '../../components/StepFormModal'
import TopNavbar from '../../components/TopNavbar'

const getUserAndMemorialPages = async (router: any, setUserName: any, setInitials: any, getMemorialPages: any, subscription: any) => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    router.push('/login')
  } else {
    const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || data.user.email
    setUserName(name)

    const first = data.user.user_metadata?.first_name || ''
    const last = data.user.user_metadata?.last_name || ''
    const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    setInitials(initials)
  }
  await getMemorialPages()

  subscription = supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'memorial_pages' },
      async () => {
        await getMemorialPages()
      }
    )
    .subscribe()
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>('MR')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memorialPages, setMemorialPages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'panel' | 'prosby' | 'zgloszenia'>('panel')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  let subscription: any

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
    getUserAndMemorialPages(router, setUserName, setInitials, getMemorialPages, subscription).finally(() => NProgress.done())
    setActiveTab('panel')

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#EDF2F7] p-0 m-0">
      {/* Pasek górny */}
      <TopNavbar onCreateMemorialPage={() => setIsModalOpen(true)} />
      <nav className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center h-[75px] relative">
          <div className="flex gap-14">
            <button 
              onClick={() => router.push('/dashboard')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${activeTab === 'panel' ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Panel główny
              {activeTab === 'panel' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
            </button>
            <button 
              onClick={() => router.push('/dashboard/prosby')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${activeTab === 'prosby' ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Prośby
              {activeTab === 'prosby' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[200%] h-[2px] bg-cyan-600"></div>}
            </button>
            <button 
              onClick={() => router.push('/dashboard/zgloszenia')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${activeTab === 'zgloszenia' ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Zgłoszenia
              {activeTab === 'zgloszenia' && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
            </button>
          </div>
        </div>
      </nav>
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
      {/* Sekcja nagłówka */}
      {/* 📱 Mobile: flex items-center space-x-4 */}
      {/* 🖥 Desktop (sm+): sm:w-12 sm:h-12 for icon, sm:text-2xl for text */}
      <div className="w-full bg-white rounded-md shadow-md shadow-gray-300/30 py-4 px-6 mb-0">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-600" />
            <div>
              <p className="font-semibold text-xl sm:text-2xl text-gray-800">Witaj, {userName || 'Użytkowniku'}</p>
              <p className="text-1xl text-gray-500">Jesteś w kreatorze wspomnień</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sekcja przycisków */}
      {/* 📱 Mobile: flex flex-col justify-center items-center gap-4 */}
      {/* 🖥 Desktop (md+): md:flex-row md:justify-end */}
      <div className="w-full bg-white rounded-md shadow-md shadow-gray-300/30 py-4 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-end justify-center items-center gap-4">
          <button
            onClick={() => router.push('/profil')}
            className="border border-gray-200 hover:border-cyan-400 transition-colors text-gray-700 rounded-full px-4 py-3 text-sm flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Cog6ToothIcon className="w-5 h-5 text-cyan-600" />
            Ustawienia konta
          </button>
          <button className="border border-gray-200 hover:border-cyan-400 transition-colors text-gray-700 rounded-full px-4 py-3 text-sm flex items-center justify-center gap-2 w-full md:w-auto">
            <PlusIcon className="w-5 h-5 text-cyan-500" />
            Stwórz mój żywy pomnik
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-700 text-sm flex items-center justify-center gap-2 w-full md:w-auto py-3"
          >
            <PlusIcon className="w-5 h-5 text-cyan-500" />
            Utwórz stronę pamięci
          </button>
        </div>
      </div>

      {/* Sekcja pamięci */}
      {/* 📱 Mobile: grid grid-cols-1 gap-4 */}
      {/* 🖥 Desktop (sm+): sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 */}
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow-md shadow-gray-300/30 pt-6 px-6 pb-10">
        <div className="rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold mb-4">Twoje pamiątki</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-700 text-sm flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              <span className="hidden sm:inline">Utwórz stronę pamięci</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => {
              const page = memorialPages[i]
              return (
                <div
                  key={page?.id || i}
                  className={`flex flex-col items-center justify-center border-2 ${page ? 'border-transparent' : 'border-dashed border-gray-300'} rounded-lg aspect-square text-center text-sm text-gray-600 cursor-pointer`}
                >
                  {page ? (
                    <button
                      onClick={() => router.push(`/memorial/${page.id}`)}
                      className="flex flex-col items-center justify-center w-full h-full"
                    >
                      <div className="relative w-32 h-32 mb-2">
                        <div className="p-[6px] bg-white rounded-2xl shadow-md">
                          <img
                            src={page.photo_url || ''}
                            alt="miniatura"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="absolute bottom-[-10px] right-[-10px] bg-white border rounded-lg shadow w-10 h-10 flex items-center justify-center">
                          <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700 truncate w-full text-center">
                        {[page.first_name, page.last_name].filter(Boolean).join(' ') || 'Strona pamięci'}
                      </div>
                      <div className="text-xs text-gray-400">{page.created_at?.slice(0, 10)}</div>
                      <div
                        onClick={async (e) => {
                          e.stopPropagation();
                          
                          // Najpierw usuń powiązania w memorial_keepers
                          const { error: keeperDeleteError } = await supabase
                            .from('memorial_keepers')
                            .delete()
                            .eq('memorial_id', page.id);
                          
                          if (keeperDeleteError) {
                            console.error('Błąd podczas usuwania opiekunów:', keeperDeleteError);
                            return;
                          }
                          
                          // Potem usuń stronę pamięci
                          const { error: deletePageError } = await supabase
                            .from('memorial_pages')
                            .delete()
                            .eq('id', page.id);
                          
                          if (deletePageError) {
                            console.error('Błąd podczas usuwania strony pamięci:', deletePageError);
                            return;
                          }
                          
                          setMemorialPages(memorialPages.filter(p => p.id !== page.id));
                        }}
                        className="mt-2 text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Usuń
                      </div>
                    </button>
                  ) : (
                    <>
                      <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center w-24 h-24 mb-2">
                        <PlusIcon className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Nowa strona pamięci</div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <KeeperPagesSection />
    </div>
  )
}