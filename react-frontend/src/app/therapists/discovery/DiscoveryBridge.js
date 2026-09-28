'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react'

const DiscoveryClient = dynamic(() => import('./DiscoveryClient'), {
  ssr: false,
  loading: () => <DiscoveryLoading text="Preparing match quiz..." />,
})

const DiscoveryIntakeClient = dynamic(() => import('./DiscoveryIntakeClient'), {
  ssr: false,
  loading: () => <DiscoveryLoading text="Loading therapist matching..." />,
})

function DiscoveryLoading({ text = "Loading..." }) {
  return (
    <Center minHeight="60vh" py={20}>
      <VStack spacing={4}>
        <Spinner size="lg" color="#56756D" thickness="3px" speed="0.75s" />
        <Text fontSize="14px" color="#5A6E65" fontFamily="'Inter', sans-serif">
          {text}
        </Text>
      </VStack>
    </Center>
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
