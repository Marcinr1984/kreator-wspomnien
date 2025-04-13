'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import TopNavbar from '../../../components/TopNavbar'

export default function ZgloszeniaPage() {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <>
      <TopNavbar />
      <nav className="w-full bg-white shadow-sm border-b border-gray-200">
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
      <div className="max-w-6xl mx-auto mt-10 py-10 px-8 bg-white rounded-md shadow-xs border text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-left">Zgłoszenia</h2>
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-4xl">🏁</span>
          </div>
          <p className="text-gray-600 text-sm max-w-md">
            Twoja kolejka zgłoszeń jest pusta. Jeśli ktoś zgłosi Twoją treść jako nieodpowiednią, pojawi się tutaj.
          </p>
        </div>
      </div>
    </>
  )
}