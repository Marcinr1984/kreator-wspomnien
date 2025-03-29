// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kreator wspomnień',
  description: 'Upamiętnij bliskich i twórz cyfrowe wspomnienia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={inter.className + ' bg-gray-50 text-gray-900'}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
            <h2 className="text-xl font-bold mb-6">🕊️ Kreator</h2>
            <nav className="space-y-2">
              <a href="/" className="block text-blue-600 hover:underline">Strona główna</a>
              <a href="/dashboard" className="block text-blue-600 hover:underline">Dashboard</a>
              <a href="/login" className="block text-blue-600 hover:underline">Logowanie</a>
              <a href="/register" className="block text-blue-600 hover:underline">Rejestracja</a>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}