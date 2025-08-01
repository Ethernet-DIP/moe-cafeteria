import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/auth-provider'

export const metadata: Metadata = {
  title: 'Moe Cafeteria',
  description: 'Moe Cafeteria',
  generator: 'Moe Cafeteria',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
