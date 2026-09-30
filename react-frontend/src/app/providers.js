'use client'

import { Suspense } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme/theme'
import { AuthProvider } from '../context/AuthContext'

export function Providers({ children }) {
  return (
    <Suspense fallback={null}>
      <ChakraProvider 
        theme={theme}
        toastOptions={{
          defaultOptions: {
            position: 'bottom-right',
            duration: 4000,
            isClosable: true,
          }
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </ChakraProvider>
    </Suspense>
  )
}
