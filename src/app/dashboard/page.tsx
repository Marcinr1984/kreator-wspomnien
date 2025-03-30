'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import { Cog6ToothIcon, PlusIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/login')
      } else {
        const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || data.user.email;
        setUserName(name)
      }
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen w-full bg-[#f3f6f8] p-0 m-0">
      {/* Sekcja nagłówka */}
      <div className="w-full bg-white rounded-md shadow-md shadow-gray-300/30 py-4 px-6 mb-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
          <button className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5 text-cyan-600" />
            Ustawienia konta
          </button>
          <button className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-cyan-500" />
            Stwórz mój Żywy Pomnik
          </button>
          <button className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-cyan-500" />
            Utwórz stronę pamięci
          </button>
        </div>
      </div>

      {/* Sekcja pamięci */}
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow-md shadow-gray-300/30 p-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Twoje pamiątki</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 h-32 text-center text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">
                <div className="text-2xl mb-2">＋</div>
                <div>Nowa strona pamięci</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}