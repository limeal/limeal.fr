import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Limeal - Junior Developer',
  description: 'Portfolio',
  icons: [
    {
      url: '/assets/images/logo.png',
    }
  ],
  authors: [
    {
      name: 'Limeal',
      url: 'https://limeal.fr',
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Analytics />
    </html>
  )
}
