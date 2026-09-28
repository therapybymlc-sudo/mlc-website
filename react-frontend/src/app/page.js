import HomeClient from './HomeClient'

export const metadata = {
  title: 'Home | MLC Health & Wellness Centre',
  description: 'A Mental Health Organization providing structured and ethical therapy across India. Start your journey with our personalized therapist matching quiz.',
  openGraph: {
    title: 'Enter the therapy ecosystem built for your journey | MLC Health',
    description: 'A space to feel, to heal, to become. Structured and ethical therapy across India with personalized therapist matching.',
    url: 'https://www.mlchealth.in',
    siteName: 'MLC Health & Wellness Centre',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 465,
        type: 'image/png',
        alt: 'MLC Health & Wellness Centre - Enter the therapy ecosystem built for your journey',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enter the therapy ecosystem built for your journey | MLC Health',
    description: 'A space to feel, to heal, to become. Structured and ethical therapy across India with personalized therapist matching.',
    images: ['/og-image.png'],
  },
}

export default function HomePage() {
  return <HomeClient />
}
