import './globals.css'
import { Poppins, Inter } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700']
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'AxioSync - Automação de WhatsApp com IA',
  description: 'Automatize seu atendimento no WhatsApp com uma inteligência artificial personalizada.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-brand-dark text-gray-200 font-sans">{children}</body>
    </html>
  )
}