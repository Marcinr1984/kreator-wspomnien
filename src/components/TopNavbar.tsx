'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabaseClient'
import {
  ChevronDownIcon,
  UserCircleIcon,
  Squares2X2Icon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UsersIcon,
  HeartIcon,
  DocumentTextIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid'

interface TopNavbarProps {
  onCreateMemorialPage?: () => void
}

export default function TopNavbar({ onCreateMemorialPage }: TopNavbarProps) {
  const [userName, setUserName] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/auth/login')
        return
      }

      const first = data.user.user_metadata?.first_name || ''
      const last = data.user.user_metadata?.last_name || ''
      const initialsValue = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || (data.user.email?.slice(0, 2).toUpperCase() ?? 'U')
      setInitials(initialsValue)
      const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || data.user.email
      setUserName(name)
    }

    loadUser()
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-[#0b1426] text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-[88px] flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="text-rose-400 text-2xl leading-none">❤️</span>
            DlaBliskich
          </div>
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Znajdź stronę pamięci lub osobę"
              className="bg-white/10 border border-white/10 text-white placeholder-white/50 rounded-2xl pl-10 pr-4 py-3 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Szukaj strony lub osoby"
              className="bg-white/10 border border-white/10 text-white placeholder-white/50 rounded-2xl pl-10 pr-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-auto" ref={menuRef}>
          <div className="relative">
            <button onClick={() => setIsMenuOpen((prev) => !prev)} className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center rounded-full border-[3px] border-cyan-400 w-10 h-10 bg-white text-cyan-600 font-semibold text-sm">
                {initials}
              </div>
              <span className="text-white text-base hidden sm:inline">{userName}</span>
              <ChevronDownIcon className="w-4 h-4 text-white" />
            </button>
            {isMenuOpen && (
              <nav className="absolute right-0 mt-3 w-64 bg-white text-gray-800 rounded-xl shadow-xl z-50">
                <ul className="py-2 text-sm">
                  <li
                    onClick={() => {
                      setIsMenuOpen(false)
                      router.push('/profil')
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <UserCircleIcon className="w-5 h-5 text-cyan-500" />
                    Mój profil
                  </li>
                  <li
                    onClick={() => {
                      setIsMenuOpen(false)
                      router.push('/dashboard')
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <Squares2X2Icon className="w-5 h-5 text-cyan-500" />
                    Panel główny
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-cyan-500" />
                    Pomoc
                  </li>
                  <hr className="my-1" />
                  <p className="px-4 py-2 text-xs text-gray-500 uppercase">Pamiątki</p>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5 text-cyan-500" />
                    Ustawienia konta
                  </li>
                  <hr className="my-1" />
                  <p className="px-4 py-2 text-xs text-gray-500 uppercase">DlaBliskich</p>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <a href="https://www.dlabliskich.pl/jak-to-dziala" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full">
                      <UsersIcon className="w-5 h-5 text-cyan-500" />
                      Jak to działa
                    </a>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-cyan-500" />
                    O nas
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-cyan-500" />
                    Wirtualne pogrzeby
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <a href="https://www.dlabliskich.pl/cennik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full">
                      <TagIcon className="w-5 h-5 text-cyan-500" />
                      Cennik
                    </a>
                  </li>
                  <hr className="my-1" />
                  <li
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push('/auth/login')
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-cyan-500" />
                    Wyloguj się
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
