'use client'

import React from 'react'
import TopNavbar from '../../../components/TopNavbar'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'
import DashboardTabs from '../../../components/DashboardTabs'

export default function ZgloszeniaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ecf2f6] via-[#eef5f9] to-[#dfe9f3] pb-20">
      <TopNavbar />
      <DashboardTabs activePath="/dashboard/zgloszenia" />
      <div className="page-fade space-y-6">
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 text-white p-8 shadow-[0_30px_60px_-20px_rgba(249,115,22,0.35)]">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg">
              <ShieldExclamationIcon className="w-10 h-10" />
            </div>
            <div>
              <p className="uppercase text-xs tracking-widest text-white/70">Zgłoszenia</p>
              <h1 className="text-3xl md:text-4xl font-semibold mt-1">Wszystko czyste!</h1>
              <p className="text-sm md:text-base text-white/80 mt-2 max-w-xl">
                Tu wyświetlą się zgłoszenia dotyczące Twoich treści. Na razie nikt nie zgłaszał żadnych nieprawidłowości – świetna robota!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-[28px] shadow-[0_30px_70px_-40px_rgba(249,115,22,0.35)] p-10 text-center border border-amber-100">
          <div className="mx-auto w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Brak zgłoszeń</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Monitorujemy zgłoszenia 24/7. Jeśli ktoś uzna Twoją treść za nieodpowiednią, pojawi się tutaj i poinformujemy Cię e-mailem.
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
