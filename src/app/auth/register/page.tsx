'use client'

import { useState } from 'react'
import { supabase } from '../../../../utils/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage('Hasła nie są takie same')
      return
    }

    const { data, error } = await supabase.auth.signUp({
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
      setMessage(error.message)
    } else {
      setMessage('Sprawdź skrzynkę e-mail, aby potwierdzić rejestrację.')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-center text-cyan-600 mb-2">Utwórz swoje konto</h2>
        <p className="text-center text-gray-700 mb-6 text-sm">
          Dołącz do Keeper, aby zacząć zachować własne dziedzictwo, aby stać się administratorem Opiekuna istniejącego pomnika i wiele więcej!
        </p>

        <label className="block mb-2 text-sm font-medium">Twoje imię na pierwszym miejscu <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="Twoje imię i nazwisko"
          className="w-full px-4 py-2 mb-4 border rounded bg-gray-50"
        />

        <label className="block mb-2 text-sm font-medium">Twoje nazwisko <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          placeholder="Twoje nazwisko"
          className="w-full px-4 py-2 mb-4 border rounded bg-gray-50"
        />

        <label className="block mb-2 text-sm font-medium">Adres e-mail <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Adres e-mail"
          className="w-full px-4 py-2 mb-4 border rounded bg-gray-50"
        />

        <label className="block mb-2 text-sm font-medium">Hasło <span className="text-red-500">*</span></label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Hasło"
          className="w-full px-4 py-2 mb-4 border rounded bg-gray-50"
        />

        <label className="block mb-2 text-sm font-medium">Ponowne wprowadzenie hasła <span className="text-red-500">*</span></label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Ponowne wprowadzenie hasła"
          className="w-full px-4 py-2 mb-4 border rounded bg-gray-50"
        />

        {message && <p className="text-sm text-center text-red-500 mb-4">{message}</p>}

        <button
          type="submit"
          className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
        >
          Utwórz konto
        </button>

        <p className="text-xs text-center mt-4 text-gray-500">
          Klikając na założenie konta, zgadzasz się na <span className="underline">Regulamin</span> i potwierdzasz, że masz powyżej 13 roku życia
        </p>

        <p className="text-sm text-center mt-4">
          Czy masz już konto?{' '}
          <a href="/auth/login" className="text-cyan-500 hover:underline">Zaloguj się</a>
        </p>
      </form>
    </div>
  )
}