import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import { Inter, Playfair_Display, Forum } from 'next/font/google'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ClientWrapper from '../components/ClientWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const forum = Forum({ weight: '400', subsets: ['latin'], variable: '--font-forum' })

export const metadata = {
  title: {
    default: 'MLC Health | Ethical Therapy Across India',
    template: '%s | MLC Health'
  },
  description: 'MLC Health & Wellness Centre provides structured and ethical mental health care. Our organization is dedicated to high-quality psychological services across major cities in India.',
}

import CookieConsent from '../components/CookieConsent'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoPlacement: 'inside',
          logoImageUrl: '/logo_tra.png',
          showOptionalFields: false,
        },
        variables: {
          colorPrimary: '#56756D',
          colorText: '#2E2E2E',
          fontFamily: "'Inter', sans-serif",
        },
        elements: {
          card: {
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          },
          footer: {
            display: 'none', // Try to hide the footer branding
          }
        }
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${playfair.variable} ${forum.variable}`}
        suppressHydrationWarning
      >
        <body suppressHydrationWarning>
          <Providers>
            <ClientWrapper>
              {children}
              <CookieConsent />
            </ClientWrapper>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
