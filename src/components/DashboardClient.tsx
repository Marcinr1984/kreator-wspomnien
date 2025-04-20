'use client'

import { useState } from 'react';
import { PlusIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import KeeperPagesSection from './KeeperPagesSection'
import StepFormModal from './StepFormModal'
import TopNavbar from './TopNavbar'

type DashboardClientProps = {
  userName: string
  initials: string
  memorialPages: any[]
}

export default function DashboardClient({ userName, initials, memorialPages }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDF2F7] p-0 m-0">
      <TopNavbar onCreateMemorialPage={() => {}} />
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mt-5">Witaj, {userName}!</h1>
        <div className="mt-5">
          <h2 className="text-xl font-semibold">Twoje wspomnienia</h2>
          <KeeperPagesSection memorialPages={memorialPages} />
        </div>
        <button
          className="mt-5 flex items-center bg-blue-500 text-white p-2 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Dodaj nową stronę wspomnień
        </button>
        <button
          className="mt-5 flex items-center bg-gray-500 text-white p-2 rounded"
          onClick={() => {}}
        >
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          Ustawienia
        </button>
        <div className="mt-5">
          <UserCircleIcon className="h-10 w-10" />
          <span className="ml-2">{initials}</span>
        </div>
      </div>
      <StepFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}