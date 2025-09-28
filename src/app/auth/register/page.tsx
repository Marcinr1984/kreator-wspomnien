'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../../utils/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [accountCreated, setAccountCreated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setError('')

    if (password !== repeatPassword) {
      setError('Hasła się nie zgadzają.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.signUp({
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
      setIsSubmitting(false)
    } else {
      setAccountCreated(true)
    }
  }

  if (accountCreated) {
    return (
      <div className="w-full max-w-4xl rounded-[32px] bg-white/95 backdrop-blur border border-white/20 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] overflow-hidden text-center p-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 text-sm font-medium">
          Konto zostało utworzone!
        </div>
        <h2 className="text-3xl font-semibold text-slate-900 mt-6">Sprawdź swoją skrzynkę pocztową</h2>
        <p className="text-sm text-slate-500 mt-3 max-w-lg mx-auto">
          Wysłaliśmy e-mail aktywacyjny. Kliknij w link, aby potwierdzić swoją rejestrację i rozpocząć tworzenie wspomnień.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition"
        >
          Przejdź do logowania
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl rounded-[32px] bg-white/95 backdrop-blur border border-white/20 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] overflow-hidden">
      <div className="grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white p-10 md:p-12 flex flex-col gap-10">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs uppercase tracking-[0.2em]">
              Zacznij pisać historię
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold mt-6">Załóż konto w DlaBliskich</h1>
            <p className="text-sm md:text-base text-white/85 mt-4 leading-relaxed">
              Utwórz przestrzeń dla wspomnień bliskich. Zapraszaj rodzinę, dziel się zdjęciami, wspomnieniami i przeżywaj najważniejsze momenty razem.
            </p>
          </div>
          <div className="space-y-3 text-white/80 text-sm">
            <p>✅ Zakładanie i prowadzenie strony jest proste i intuicyjne.</p>
            <p>✅ Możesz zaprosić opiekunów, rodzinę i przyjaciół.</p>
            <p>✅ Twoje wspomnienia pozostaną w bezpiecznym miejscu.</p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Utwórz swoje konto</h2>
            <p className="text-sm text-slate-500">
              Wypełnij formularz, aby rozpocząć przygodę z DlaBliskich. Masz już konto?{' '}
              <Link href="/auth/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Zaloguj się
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Imię</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Twoje imię"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Nazwisko</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Twoje nazwisko"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Adres e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. anna@dlabliskich.pl"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Hasło</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wybierz hasło"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Powtórz hasło</label>
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Powtórz hasło"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 text-white py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {isSubmitting ? 'Tworzenie konta...' : 'Utwórz konto'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Klikając „Utwórz konto”, zgadzasz się z{' '}
              <a href="https://www.dlabliskich.pl/regulamin" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700">
                Regulaminem
              </a>{' '}
              oraz potwierdzasz, że masz powyżej 13 lat.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
