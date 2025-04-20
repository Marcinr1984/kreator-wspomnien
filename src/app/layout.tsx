'use client';
import './globals.css'
import { Nunito } from 'next/font/google'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <html lang="pl">
      <body className={nunito.className}>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={null}
        >
          {children}
        </SessionContextProvider>
      </body>
    </html>
  )
}