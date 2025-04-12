'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function ZgloszeniaPage() {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <>
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
      <div className="max-w-6xl mx-auto py-10 px-6 text-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Zgłoszenia</h2>
        <p>Tu będą pojawiać się zgłoszenia użytkowników lub raporty.</p>
      </div>
    </>
  )
}