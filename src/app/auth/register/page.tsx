'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'
import '../../../styles/globals.css';  // Upewnij się, że ścieżka jest prawidłowa

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [accountCreated, setAccountCreated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== repeatPassword) {
      setError('Hasła się nie zgadzają.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setAccountCreated(true)
    }
  }

  return accountCreated ? (
    <div className="min-h-screen w-full bg-[#EDF2F7] flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Konto zostało utworzone!</h2>
        <p className="text-gray-700 mb-6">
          Sprawdź swoją skrzynkę mailową i kliknij w link aktywacyjny, aby dokończyć rejestrację.
        </p>
        <a
          href="/auth/login"
          className="inline-block bg-[#00bcd4] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#00a6bb]"
        >
          Przejdź do logowania
        </a>
      </div>
    </div>
  ) : (
    <div className="min-h-screen w-full bg-[#EDF2F7] flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="w-full max-w-lg bg-white px-4 py-6 sm:px-8 sm:py-10 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-normal text-center text-[#00bcd4] mb-2">
          Utwórz swoje konto
        </h1>
        <p className="text-center text-base leading-relaxed text-gray-600 mb-8">
          Dołącz do DlaBliskich, aby zachować własne dziedzictwo, aby utworzyć stronę pamięci lub żywy pomnika!
        </p>
        <div className="w-full h-[2px] bg-[#00bcd4] mb-8" />
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twoje imię <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              placeholder="Twoje imię"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twoje nazwisko <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              placeholder="Twoje nazwisko"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adres e-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              placeholder="Adres e-mail"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hasło <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              placeholder="Hasło"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Powtórz hasło <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              placeholder="Powtórz hasło"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#00bcd4] text-white py-2 rounded-md font-semibold hover:bg-[#00a6bb]"
          >
            Utwórz konto
          </button>

          <p className="text-xs text-center text-gray-500 mt-2">
            Klikając na założenie konta, zgadzasz się na{' '}
            <span className="text-[#00bcd4] underline cursor-pointer">Regulamin</span>{' '}
            i potwierdzasz, że masz powyżej 13 roku życia
          </p>

          <p className="text-sm text-center text-gray-600 mt-4">
            Czy masz już konto?{' '}
            <a href="/auth/login" className="text-[#00bcd4] hover:underline">
              Zaloguj się
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
