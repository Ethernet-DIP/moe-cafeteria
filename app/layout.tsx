import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
