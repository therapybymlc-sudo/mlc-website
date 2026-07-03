'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import { Box } from '@chakra-ui/react'

export default function ClientWrapper({ children }) {
  const pathname = usePathname()

  const isDashboard = pathname?.startsWith('/dashboard')
  const isLoginOrSignup = pathname?.startsWith('/login') || pathname?.startsWith('/signup')
  const hideFurniture = isDashboard || isLoginOrSignup

  return (
    <>
      {!hideFurniture && <Navbar />}
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      {!hideFurniture && <Footer />}
    </>
  )
}
