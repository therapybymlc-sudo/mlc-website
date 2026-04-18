import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import { Inter, Playfair_Display } from 'next/font/google'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ClientWrapper from '../components/ClientWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  title: {
    default: 'MLC Health | Ethical Therapy Across India',
    template: '%s | MLC Health'
  },
  description: 'MLC Health & Wellness Centre provides structured and ethical mental health care. Our organization is dedicated to high-quality psychological services across major cities in India.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body>
          <Providers>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
