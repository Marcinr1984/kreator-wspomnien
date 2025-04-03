'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')

    if (type === 'signup') {
      setShowMessage(true)
      const timer = setTimeout(() => {
        router.push('/auth/login') // zmienione na prawidłową ścieżkę logowania
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      router.push('/auth/login')
    }
  }, [router])

  if (!showMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm">Aktywuję konto...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-green-600">Konto zostało aktywowane</h1>
        <p className="text-gray-600 mt-2">Zaraz zostaniesz przekierowany do strony logowania...</p>
      </div>
    </div>
  )
}
