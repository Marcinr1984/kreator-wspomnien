'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../../utils/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f6faf9] flex items-center justify-center p-0 m-0">
      <div className="w-full max-w-md bg-white p-0 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-[#00bcd4] mb-2">
          Zaloguj się
        </h1>
        <p className="text-center text-base leading-relaxed text-gray-600 mb-8">
          Wprowadź swój adres e-mail i hasło, aby uzyskać dostęp do konta.
        </p>

        <form
          className="space-y-4 max-w-[20rem] mx-auto"
          onKeyDown={handleKeyDown}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adres e-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hasło <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#00bcd4]"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-[#00bcd4] text-white py-2 rounded-md font-semibold hover:bg-[#00a6bb]"
          >
            Zaloguj się
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Nie masz jeszcze konta?{' '}
            <a href="/auth/register" className="text-[#00bcd4] hover:underline">
              Zarejestruj się
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
