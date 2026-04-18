'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import { Box } from '@chakra-ui/react'

export default function ClientWrapper({ children }) {
  const pathname = usePathname()
  
  // Define routes where we don't want the global Navbar/Footer
  const isDashboard = pathname?.startsWith('/dashboard')
  const isLoginOrSignup = pathname?.startsWith('/login') || pathname?.startsWith('/signup')
  
  const hideFurniture = isDashboard || isLoginOrSignup

  if (hideFurniture) {
    return <main style={{ minHeight: '100vh' }}>{children}</main>
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
