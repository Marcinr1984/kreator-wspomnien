'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')

    if (type === 'signup') {
      router.push('/callback' + window.location.hash)
    }
  }, [router])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Witaj w kreatorze wspomnień</h1>
      <a href="auth/login" className="text-blue-600 underline mr-4">Zaloguj się</a>
      <a href="auth/register" className="text-blue-600 underline">Zarejestruj się</a>
    </main>
  )
}