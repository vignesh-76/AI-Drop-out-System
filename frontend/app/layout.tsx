import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'EduPulse - Student Risk Prediction',
  description: 'AI-powered student dropout risk prediction platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'oklch(0.14 0.01 260)',
              border: '1px solid oklch(0.25 0.01 260)',
              color: 'oklch(0.98 0 0)',
            },
          }}
        />
      </body>
    </html>
  )
}
