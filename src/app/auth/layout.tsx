// src/app/auth/layout.tsx
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${nunito.className} font-sans`}>
        {children}
      </body>
    </html>
  )
}