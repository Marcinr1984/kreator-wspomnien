'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabaseClient'
import {
  ChevronDownIcon,
  UserCircleIcon,
  Squares2X2Icon,
  QuestionMarkCircleIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UsersIcon,
  HeartIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid'

export default function TopNavbar({ onCreateMemorialPage }: { onCreateMemorialPage?: () => void }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>('MR')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/login')
      } else {
        const name = data.user.user_metadata?.first_name || data.user.user_metadata?.name || data.user.email
        setUserName(name)

        const first = data.user.user_metadata?.first_name || ''
        const last = data.user.user_metadata?.last_name || ''
        const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
        setInitials(initials)
      }
    }
    getUser()
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <nav className="w-full bg-gray-900 text-white py-5 px-6 flex items-center">
      {/* Logo visible on both mobile and desktop */}
      <div className="text-white font-bold text-xl tracking-tight">❤️ DlaBliskich</div>

      {/* Wrapper for mobile icons: search and hamburger */}
      <div className="md:hidden flex items-center ml-auto gap-4">
        {/* Mobile magnifying glass icon */}
        <div>
          <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <MagnifyingGlassIcon className="w-5 h-5 text-white mt-1.5" />
          </button>
        </div>
        {isSearchOpen && (
          <div className="absolute top-[64px] left-0 w-full z-40">
            <div className="w-full bg-gray-900 py-4 px-6">
              <input
                type="text"
                placeholder="Szukaj..."
                className="w-full bg-white text-gray-800 placeholder-gray-500 rounded-xl px-5 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>
          </div>
        )}
        {/* Hamburger menu button visible only on mobile */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop search input */}
      <div className="hidden md:block ml-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-[50%] -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Znajdź stronę pamięci lub osobę"
            className="bg-[#1e2a38] text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-4 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
        </div>
      </div>

      {/* Desktop user menu */}
      <div className="relative ml-auto hidden md:block" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 bg-transparent text-white px-2 py-1 text-sm"
        >
          <div className="flex items-center justify-center rounded-full border-[3px] border-cyan-400 w-10 h-10 bg-white text-cyan-600 font-semibold text-sm">
            {initials}
          </div>
          <span className="text-white text-base">{userName}</span>
          <ChevronDownIcon className="w-4 h-4 text-white" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl z-50">
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
              <p className="px-4 py-2 text-xs text-gray-500 uppercase">PAMIĄTKI</p>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-cyan-500" />
                {userName}
              </li>
              <li
                onClick={() => {
                  setIsMenuOpen(false)
                  onCreateMemorialPage?.()
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5 text-cyan-500" />
                Utwórz stronę pamięci
              </li>
              <hr className="my-1" />
              <p className="px-4 py-2 text-xs text-gray-500 uppercase">DlaBliskich</p>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-cyan-500" />
                Jak to działa
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                <Squares2X2Icon className="w-5 h-5 text-cyan-500" />
                Funkcje
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
                <BriefcaseIcon className="w-5 h-5 text-cyan-500" />
                Dla firm
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-cyan-500" />
                Cennik
              </li>
              <hr className="my-1" />
              <li
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('auth/login')
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-cyan-500" />
                Wyloguj się
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile sliding menu */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className={`absolute top-0 right-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out p-6 overflow-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } pointer-events-auto`}>
          <button onClick={() => setIsMobileMenuOpen(false)} className="mb-4 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ul className="text-gray-800 text-sm">
            <li
              onClick={() => {
                setIsMobileMenuOpen(false)
                router.push('/profil')
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <UserCircleIcon className="w-5 h-5 text-cyan-500" />
              Mój profil
            </li>
            <li
              onClick={() => {
                setIsMobileMenuOpen(false)
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
            <p className="px-4 py-2 text-xs text-gray-500 uppercase">PAMIĄTKI</p>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-cyan-500" />
              {userName}
            </li>
            <li
              onClick={() => {
                setIsMobileMenuOpen(false)
                onCreateMemorialPage?.()
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5 text-cyan-500" />
              Utwórz stronę pamięci
            </li>
            <hr className="my-1" />
            <p className="px-4 py-2 text-xs text-gray-500 uppercase">DlaBliskich</p>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-cyan-500" />
              Jak to działa
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Squares2X2Icon className="w-5 h-5 text-cyan-500" />
              Funkcje
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
              <BriefcaseIcon className="w-5 h-5 text-cyan-500" />
              Dla firm
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-cyan-500" />
              Cennik
            </li>
            <hr className="my-1" />
            <li
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('auth/login')
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-cyan-500" />
              Wyloguj się
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
