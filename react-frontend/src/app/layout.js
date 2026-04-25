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
    default: 'MLC Health | India\'s First Integrated Therapy Ecosystem',
    template: '%s | MLC Health'
  },
  description: 'MLC Health and Wellness Centre is building India\'s first integrated therapy ecosystem. A unified platform for ethical therapy, clinical supervision, and professional growth across India.',
}

import CookieConsent from '../components/CookieConsent'

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
      "https://www.instagram.com/mlchealth"
    ]
  };

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
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
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
