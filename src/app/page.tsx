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

  return null
}