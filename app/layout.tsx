import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const _geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'MiniMart — Shop essentials, fast.',
  description:
    'A premium, minimal e-commerce storefront for discovering and ordering everyday essentials.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <CartProvider>
          <Suspense>
            <Navbar />
          </Suspense>
          <main>{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
