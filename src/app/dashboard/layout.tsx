'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setIsLoggedIn(true)
      } else {
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="flex min-h-screen">
      {isLoggedIn && <Sidebar />}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  )
}