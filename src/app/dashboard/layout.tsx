'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { useRouter } from 'next/navigation'
import Loading from '../../components/Loading'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setIsLoggedIn(true)
      } else {
        router.push('/auth/login')
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  if (isLoading) return <Loading />

  return (
    <main className="min-h-screen p-0 bg-gray-50 font-sans">{children}</main>
  )
}