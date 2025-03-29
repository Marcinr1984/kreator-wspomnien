// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Rejestracja</h1>
      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Hasło"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-600">{error}</p>}
      <button onClick={handleRegister} className="bg-black text-white px-4 py-2 rounded">
        Zarejestruj się
      </button>
    </div>
  )
}