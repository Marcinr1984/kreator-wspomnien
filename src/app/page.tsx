'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')

    if (type === 'signup') {
      setShouldRender(false)
      router.push('/callback' + window.location.hash)
    }
  }, [router])

  if (!shouldRender) {
    return null
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Witaj w kreatorze wspomnień</h1>
      <a href="auth/login" className="text-blue-600 underline mr-4">Zaloguj się</a>
      <a href="auth/register" className="text-blue-600 underline">Zarejestruj się</a>
    </main>
  )
}