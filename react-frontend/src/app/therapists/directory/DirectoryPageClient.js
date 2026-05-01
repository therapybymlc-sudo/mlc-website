'use client'

import dynamic from 'next/dynamic'

const DirectoryClient = dynamic(() => import('./DirectoryClient'), { ssr: false })

export default function DirectoryPageClient() {
  return <DirectoryClient />
}
