import dynamic from 'next/dynamic'

const DirectoryClient = dynamic(() => import('./DirectoryClient'), { ssr: false })

export const metadata = {
  title: 'Our Therapists | MLC Collective',
  description: 'Meet our world-class therapists. Browse our collective of highly specialized mental health professionals and book your session directly.',
}

export default function DirectoryPage() {
  return <DirectoryClient />
}
