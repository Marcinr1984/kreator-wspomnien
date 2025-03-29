'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Hasła nie są takie same.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafa] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-center text-2xl font-bold text-[#00add8] mb-4">Utwórz swoje konto</h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Dołącz do Keeper, aby zacznąć zachować własne dziedzictwo, aby stać się administratorem Opiekuna istniejącego pomnika i wiele więcej!
        </p>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900">Twoje imię na pierwszym miejscu *</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border border-gray-300 bg-gray-50 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#00add8]"
              placeholder="Twoje imię i nazwisko"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">Twoje nazwisko :)</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border border-gray-300 bg-gray-50 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#00add8]"
              placeholder="Twoje nazwisko"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">Adres e-mail &gt;&gt; *</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 bg-gray-50 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#00add8]"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">Hasło :</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 bg-gray-50 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#00add8]"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">Ponowne wprowadzenie hasła &gt;&gt;</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 bg-gray-50 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#00add8]"
              placeholder="Ponowne wprowadzenie hasła"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#00add8] hover:bg-[#009ec5] text-white font-semibold py-2 px-4 rounded-md"
          >
            Utwórz konto
          </button>

          <p className="text-xs text-gray-600 text-center">
            Klikając na założenie konta, zgadzasz się na <a href="#" className="underline">Regulamin</a> i potwierdzasz, że masz powyżej 13 roku życia
          </p>

          <p className="text-sm text-center mt-4">
            Czy masz już konto?{' '}
            <a href="/auth/login" className="text-[#00add8] font-medium">Zaloguj się</a>
          </p>
        </form>
      </div>
    </div>
  )
}
