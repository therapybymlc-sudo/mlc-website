'use client'

import { Suspense } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme/theme'
import { AuthProvider } from '../context/AuthContext'

export function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <Suspense fallback={null}>
        <AuthProvider>{children}</AuthProvider>
      </Suspense>
    </ChakraProvider>
  )
}
