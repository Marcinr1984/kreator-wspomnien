'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import TopNavbar from '../../../components/TopNavbar'

export default function ProsbyPage() {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <>
      <TopNavbar />
      <nav className="w-full bg-white shadow-xs border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center h-[75px] relative">
          <div className="flex gap-14">
            <button 
              onClick={() => router.push('/dashboard')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${isActive('/dashboard') ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Panel główny
              {isActive('/dashboard') && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
            </button>
            <button 
              onClick={() => router.push('/dashboard/prosby')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${isActive('/dashboard/prosby') ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Prośby
              {isActive('/dashboard/prosby') && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[200%] h-[2px] bg-cyan-600"></div>}
            </button>
            <button 
              onClick={() => router.push('/dashboard/zgloszenia')}
              className={`relative text-base font-medium pb-1 mb-[-14px] ${isActive('/dashboard/zgloszenia') ? 'text-cyan-600' : 'text-gray-600'}`}
            >
              Zgłoszenia
              {isActive('/dashboard/zgloszenia') && <div className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-[160%] h-[2px] bg-cyan-600"></div>}
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto py-10 px-6 flex gap-6 text-gray-700">
        {/* LEWA KOLUMNA - FILTRY */}
        <div className="w-1/3 bg-white p-6 rounded-md shadow-xs border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mt-3 ml-3">Filtry</h2>
            <button className="text-sm text-cyan-600 hover:underline mr-3">Wyczyść wszystko</button>
          </div>
          <div className="space-y-4">
            <p className="text-base font-semibold mt-1 ml-3">Typy próśb</p>
            {["Prośba o treść", "Prośba od DlaBliskich", "Prośba o stronę pamięci", "Prośba o hasło", "Prośba o link", "Prośba o relację"].map(label => (
              <div key={label} className="flex items-center gap-2 ml-3">
                <input type="radio" name="requestType" className="accent-gray-400" />
                <label className="text-sm">{label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* PRAWA KOLUMNA - PUSTA LISTA */}
        <div className="flex-1 bg-white py-10 px-10 rounded-md shadow-xs border">
          <h2 className="text-xl font-semibold text-gray-800 mb-8">Prośby</h2>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🏁</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Brak próśb</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Twoja kolejka próśb jest pusta. Gdy ktoś poprosi o zostanie opiekunem lub dostęp do Twojej strony pamięci, zobaczysz to tutaj.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}