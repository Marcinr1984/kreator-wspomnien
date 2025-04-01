'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import { Cog6ToothIcon, PlusIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'
import StepFormModal from '../../components/StepFormModal'

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memorialPages, setMemorialPages] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
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

    const getUserAndMemorialPages = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/login')
      } else {
        const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || data.user.email
        setUserName(name)
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

    getUserAndMemorialPages()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen w-full bg-[#EDF2F7] p-0 m-0">
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
      <div className="w-full bg-white rounded-md shadow-md shadow-gray-300/30 py-4 px-6 mb-0">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <UserCircleIcon className="w-12 h-12 text-cyan-600" />
            <div>
              <p className="font-semibold text-2xl text-gray-800">Witaj, {userName || 'Użytkowniku'}</p>
              <p className="text-1xl text-gray-500">Jesteś w kreatorze wspomnień</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline flex items-center gap-1">
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
            Wyloguj się
          </button>
        </div>
      </div>

      {/* Sekcja przycisków */}
      <div className="w-full bg-white rounded-md shadow-md shadow-gray-300/30 py-4 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-end">
          <button className="border border-gray-200 hover:border-cyan-400 transition-colors text-gray-700 rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5 text-cyan-600" />
            Ustawienia konta
          </button>
          <button className="border border-gray-200 hover:border-cyan-400 transition-colors text-gray-700 rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-cyan-500" />
            Stwórz mój żywy pomnik
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-700 text-sm flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5 text-cyan-500" />
            Utwórz stronę pamięci
          </button>
        </div>
      </div>

      {/* Sekcja pamięci */}
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow-md shadow-gray-300/30 pt-6 px-6 pb-10">
        <div className="rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold mb-4">Twoje pamiątki</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-700 text-sm flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              Utwórz stronę pamięci
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => {
              const page = memorialPages[i]
              return (
                <div
                  key={page?.id || i}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-square text-center text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {page ? (
                    <button
                      onClick={() => router.push(`/memorial/${page.id}`)}
                      className="flex flex-col items-center justify-center w-full h-full"
                    >
                      <div className="bg-gray-100 p-0 rounded-lg flex items-center justify-center w-24 h-24 mb-2">
                        {page.photo_url ? (
                          <img src={page.photo_url} alt="miniatura" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl text-gray-500">📘</span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 truncate w-full text-center">
                        {[page.first_name, page.last_name].filter(Boolean).join(' ') || 'Strona pamięci'}
                      </div>
                      <div className="text-xs text-gray-400">{page.created_at?.slice(0, 10)}</div>
                      <div
                        onClick={async (e) => {
                          e.stopPropagation()
                          const { error } = await supabase.from('memorial_pages').delete().eq('id', page.id);
                          if (error) {
                            console.error('Błąd podczas usuwania strony pamięci:', error);
                          } else {
                            setMemorialPages(memorialPages.filter(p => p.id !== page.id));
                          }
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
    </div>
  )
}