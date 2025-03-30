import './globals.css'
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata = {
  title: 'Kreator wspomnień',
  description: 'Strona pamiątkowa dla bliskich',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={nunito.className}>
        {children}
      </body>
    </html>
  )
}