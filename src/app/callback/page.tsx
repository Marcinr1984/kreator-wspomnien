// Create file /src/app/callback/layout.tsx
export default function CallbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Update /src/app/callback/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthMessage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const type = searchParams.get('type')

    if (type === 'signup') {
      setShowMessage(true)
      const timer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      router.push('/login')
    }
  }, [router, searchParams])

  if (!showMessage) return null

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-green-600">Konto zostało aktywowane</h1>
        <p className="text-gray-600 mt-2">Zaraz zostaniesz przekierowany do strony logowania...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Ładowanie...</div>}>
      <AuthMessage />
    </Suspense>
  )
}