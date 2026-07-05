'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'

const DiscoveryClient = dynamic(() => import('./DiscoveryClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Loading therapist matching...</p>
    </div>
  ),
})

const DiscoveryIntakeClient = dynamic(() => import('./DiscoveryIntakeClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Loading...</p>
    </div>
  ),
})

function DiscoveryLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Loading...</p>
    </div>
  )
}

function DiscoveryBridgeInner() {
  const searchParams = useSearchParams()
  const { isAdmin } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <DiscoveryLoading />
  }

  const mode =
    process.env.NEXT_PUBLIC_THERAPIST_MATCHING_MODE ||
    process.env.NEXT_PUBLIC_TH_MATCHING_MODE ||
    'manual'
  const adminFullQuiz = searchParams.get('full') === '1' && isAdmin

  if (adminFullQuiz || mode === 'auto') {
    return <DiscoveryClient />
  }

  return <DiscoveryIntakeClient />
}

export default function DiscoveryBridge() {
  return (
    <Suspense fallback={<DiscoveryLoading />}>
      <DiscoveryBridgeInner />
    </Suspense>
  )
}
