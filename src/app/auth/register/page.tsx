'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są takie same.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Sprawdź swoją skrzynkę e-mail, aby potwierdzić rejestrację.')
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5fafa]">
      <div className="bg-white p-10 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-center text-[#00bcd4] text-2xl font-semibold mb-2">Utwórz swoje konto</h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Dołącz do Keeper, aby zacząć zachować własne dziedzictwo, aby stać się administratorem Opiekuna istniejącego pomnika i wiele więcej!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Twoje imię na pierwszym miejscu *</label>
            <input
              type="text"
              name="firstName"
              placeholder="Twoje imię i nazwisko"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Twoje nazwisko :)</label>
            <input
              type="text"
              name="lastName"
              placeholder="Twoje nazwisko"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Adres e-mail &gt;&gt; *</label>
            <input
              type="email"
              name="email"
              placeholder="Adres e-mail"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Hasło :</label>
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ponowne wprowadzenie hasła &gt;&gt;</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Ponowne wprowadzenie hasła"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <button type="submit" className="bg-[#00bcd4] w-full py-2 rounded text-white hover:bg-[#0097a7] transition">
            Utwórz konto
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-4">
          Klikając na założenie konta, zgadzasz się na <a className="underline text-blue-600">Regulamin</a> i potwierdzasz, że masz powyżej 13 roku życia
        </p>
        <p className="text-center mt-2 text-sm">
          Czy masz już konto?{' '}
          <a href="/auth/login" className="text-[#00bcd4] hover:underline">
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  )
}
