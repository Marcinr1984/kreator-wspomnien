'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../../utils/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async () => {
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Nieprawidłowy adres e-mail lub hasło')
      setIsSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-5xl rounded-[32px] bg-white/95 backdrop-blur border border-white/20 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] overflow-hidden">
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative bg-gradient-to-br from-cyan-500 via-sky-500 to-purple-500 text-white p-10 md:p-12 flex flex-col gap-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs uppercase tracking-[0.2em]">
              Twoje wspomnienia
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold mt-6">Witaj ponownie!</h1>
            <p className="text-sm md:text-base text-white/85 mt-4 leading-relaxed">
              Zaloguj się, aby kontynuować tworzenie stron pamięci, zapraszać opiekunów i dzielić się dorobkiem życia najbliższych.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
            <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 border border-white/15">
              <p className="text-xs uppercase tracking-widest text-white/60">Opiekunowie</p>
              <p className="text-xl font-semibold mt-1">+200</p>
              <p className="text-xs text-white/60">aktywnych użytkowników dziennie</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 border border-white/15">
              <p className="text-xs uppercase tracking-widest text-white/60">Strony pamięci</p>
              <p className="text-xl font-semibold mt-1">5 000+</p>
              <p className="text-xs text-white/60">historii zapisanych na zawsze</p>
            </div>
          </div>
          <p className="text-xs text-white/60">❤️ DlaBliskich – przestrzeń na wspomnienia.</p>
        </div>

        <div className="bg-white p-8 md:p-10">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Zaloguj się</h2>
            <p className="text-sm text-slate-500">
              Wprowadź dane, aby wejść do panelu. Nie masz konta?{' '}
              <Link href="/auth/register" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 text-white py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
            </button>

            <div className="text-sm text-slate-500 flex items-center justify-between">
              <Link href="/auth/register" className="hover:text-cyan-600">
                Nie masz konta? Zarejestruj się
              </Link>
              <a href="https://www.dlabliskich.pl/#contact" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600">
                Potrzebujesz pomocy?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
