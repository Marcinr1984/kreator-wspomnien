// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Kreator wspomnień',
  description: 'Upamiętnij bliskich i twórz cyfrowe wspomnienia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={nunito.className + ' bg-gray-50 text-gray-900'}>
        {children}
      </body>
    </html>
  )
}