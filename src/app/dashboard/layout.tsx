'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { useRouter } from 'next/navigation'
import Loading from '../../components/Loading'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push('/auth/login')
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  if (isLoading) return <Loading />

  return children
}