'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'

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
    <div className="min-h-screen w-full bg-gray-100 p-0 m-0">
      {/* Sekcja nagłówka */}
      <div className="w-full bg-white rounded-md shadow py-4 px-6 mb-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-lg text-white">👤</div>
            <div>
              <p className="font-semibold text-3xl text-gray-800">Witaj, {userName || 'Użytkowniku'}</p>
              <p className="text-1xl text-gray-500">Jesteś w kreatorze wspomnień</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
            Wyloguj się
          </button>
        </div>
      </div>

      {/* Sekcja przycisków */}
      <div className="w-full bg-white rounded-md shadow py-4 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-end">
          <button className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <span className="text-cyan-600">⚙️</span>
            Ustawienia konta
          </button>
          <button className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <span className="text-cyan-500">➕</span>
            Stwórz mój Żywy Pomnik
          </button>
          <button className="border border-gray-300 text-cyan-700 rounded-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <span className="text-cyan-500">➕</span>
            Utwórz stronę pamięci
          </button>
        </div>
      </div>

      {/* Sekcja pamięci */}
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow p-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Twoje pamiątkii</h2>
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