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
    <header className="relative bg-[#0b1426] text-white border-b border-white/10">
      <div className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-4 pb-5 md:py-0 md:h-[88px]">
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-y-3 md:flex md:h-full md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="col-start-1 md:col-auto flex items-center justify-start gap-3 md:gap-5 text-xl font-semibold tracking-tight text-left md:flex md:flex-1">
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-rose-400 text-2xl leading-none">❤️</span>
                DlaBliskich
              </div>
              <div className="relative hidden md:flex items-center md:flex-1 md:max-w-[260px] lg:max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Znajdź stronę pamięci lub osobę"
                  className="bg-[#131d33] border border-white/15 text-white placeholder-white/60 rounded-2xl pl-10 pr-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
                />
              </div>
            </div>

            <div
              className="col-start-3 flex items-center gap-3 md:gap-6 justify-self-end md:justify-self-auto md:ml-auto"
              ref={menuRef}
            >
              <button
                type="button"
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#131d33] text-white/70 transition-colors hover:text-white"
                aria-label="Otwórz wyszukiwanie"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <div className="relative">
                <button onClick={() => setIsMenuOpen((prev) => !prev)} className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                  <div className="flex items-center justify-center rounded-full border-[3px] border-cyan-400 w-9 h-9 text-xs bg-white text-cyan-600 font-semibold md:w-10 md:h-10 md:text-sm">
                    {initials}
                  </div>
                  <span className="text-white text-base hidden sm:inline">{userName}</span>
                  <ChevronDownIcon className="w-4 h-4 text-white" />
                </button>
                {isMenuOpen && (
                  <nav className="absolute right-0 mt-4 w-[min(18rem,85vw)] rounded-3xl border border-white/10 bg-[#0f1b33]/95 backdrop-blur-xl text-white shadow-[0_24px_60px_-30px_rgba(14,116,144,0.65)] z-50 p-3">
                    <ul className="space-y-1 text-sm">
                      <li
                        onClick={() => {
                          setIsMenuOpen(false)
                          router.push('/profil')
                        }}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <UserCircleIcon className="w-5 h-5 text-cyan-500" />
                        Mój profil
                      </li>
                      <li
                        onClick={() => {
                          setIsMenuOpen(false)
                          router.push('/dashboard')
                        }}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <Squares2X2Icon className="w-5 h-5 text-cyan-500" />
                        Panel główny
                      </li>
                      <li className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-cyan-500" />
                        Pomoc
                      </li>
                      <hr className="my-2 border-white/10" />
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Pamiątki</p>
                      <li className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <Cog6ToothIcon className="w-5 h-5 text-cyan-500" />
                        Ustawienia konta
                      </li>
                      <hr className="my-2 border-white/10" />
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">DlaBliskich</p>
                      <li className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <a href="https://www.dlabliskich.pl/jak-to-dziala" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full text-inherit no-underline">
                          <UsersIcon className="w-5 h-5 text-cyan-500" />
                          Jak to działa
                        </a>
                      </li>
                      <li className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <HeartIcon className="w-5 h-5 text-cyan-500" />
                        O nas
                      </li>
                      <li className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <DocumentTextIcon className="w-5 h-5 text-cyan-500" />
                        Wirtualne pogrzeby
                      </li>
                      <li className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <a href="https://www.dlabliskich.pl/cennik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full text-inherit no-underline">
                          <TagIcon className="w-5 h-5 text-cyan-500" />
                          Cennik
                        </a>
                      </li>
                      <hr className="my-2 border-white/10" />
                      <li
                        onClick={async () => {
                          await supabase.auth.signOut()
                          router.push('/auth/login')
                        }}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
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
        </div>
      </div>
    </header>
  )
}
