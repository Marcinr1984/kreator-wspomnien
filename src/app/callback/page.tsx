'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const fullUrl = window.location.href
    const url = new URL(fullUrl)
    const hashParams = new URLSearchParams(url.hash.substring(1))
    const type = hashParams.get('type')

    if (type === 'signup') {
      setShowMessage(true)
      const timer = setTimeout(() => {
        router.push('/auth/login')
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
