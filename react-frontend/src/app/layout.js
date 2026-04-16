import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  title: {
    default: 'MLC Health | Ethical Therapy Across India',
    template: '%s | MLC Health'
  },
  description: 'MLC Health & Wellness Centre provides structured and ethical mental health care. Our organization is dedicated to high-quality psychological services across major cities in India.',
  keywords: ['ethical therapy', 'mental health organization', 'therapy India', 'counselling', 'psychotherapy'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mlchealth.in',
    siteName: 'MLC Health & Wellness Centre',
    images: [
      {
        url: 'https://mlchealth.in/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'MLC Health & Wellness Centre'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MLC Health | Ethical Therapy',
    description: 'Structured and ethical therapy provided by a dedicated mental health organization.',
    images: ['https://mlchealth.in/hero-bg.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
