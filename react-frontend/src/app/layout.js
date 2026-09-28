import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import { Inter, Playfair_Display, Forum } from 'next/font/google'
import ClientWrapper from '../components/ClientWrapper'
import CookieConsent from '../components/CookieConsent'
import GoogleAnalytics from '../components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const forum = Forum({ weight: '400', subsets: ['latin'], variable: '--font-forum' })

export const metadata = {
  metadataBase: new URL('https://www.mlchealth.in'),
  title: {
    default: 'MLC Health | India\'s First Integrated Therapy Ecosystem',
    template: '%s | MLC Health'
  },
  description: 'MLC Health and Wellness Centre is building India\'s first integrated therapy ecosystem. A unified platform for ethical therapy, clinical supervision, and professional growth across India.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=3' },
      { url: '/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
      { url: '/favicon.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: '/apple-touch-icon.png?v=3',
  },
  openGraph: {
    title: 'MLC Health | India\'s First Integrated Therapy Ecosystem',
    description: 'A Mental Health Organization providing structured, ethical, and evidence-informed therapy across India. Start your journey with our personalized therapist matching quiz.',
    url: 'https://www.mlchealth.in',
    siteName: 'MLC Health and Wellness Centre',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 465,
        type: 'image/png',
        alt: 'MLC Health and Wellness Centre - Enter the therapy ecosystem built for your journey',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MLC Health | India\'s First Integrated Therapy Ecosystem',
    description: 'A Mental Health Organization providing structured, ethical, and evidence-informed therapy across India. Start your journey with our personalized therapist matching quiz.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MLC Health and Wellness Centre",
    "url": "https://www.mlchealth.in",
    "logo": "https://www.mlchealth.in/logo_tra.png",
    "description": "A Mental Health Organization providing structured, ethical, and evidence-informed therapy across India.",
    "email": "therapy@mlchealth.in",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "areaServed": [
      "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", 
      "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Gurugram", "Noida", 
      "Indore", "Bhopal", "Patna", "Vadodara", "Nagpur", "Kochi", "Coimbatore"
    ],
    "sameAs": [
      "https://www.instagram.com/mlc_healthandwellness/",
      "https://www.linkedin.com/in/mlc-health-and-wellness-centre-9b35b6394/"
    ]
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${forum.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
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
                display: 'none',
              }
            }
          }}
        >
          <Providers>
            <ClientWrapper>
              {children}
              <CookieConsent />
              <GoogleAnalytics />
            </ClientWrapper>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
