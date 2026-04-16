'use client'

import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme/theme'
import { AuthProvider } from '../context/AuthContext'

export function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ChakraProvider>
  )
}
