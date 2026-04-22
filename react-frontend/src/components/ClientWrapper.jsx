'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import { Box } from '@chakra-ui/react'

import { useState, useEffect } from 'react'

export default function ClientWrapper({ children }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Define routes where we don't want the global Navbar/Footer
  const isDashboard = pathname?.startsWith('/dashboard')
  const isLoginOrSignup = pathname?.startsWith('/login') || pathname?.startsWith('/signup')
  
  const hideFurniture = isDashboard || isLoginOrSignup

  // During SSR, we render a consistent structure
  // On the client, after mounting, we can conditionally hide things safely
  return (
    <>
      {mounted && !hideFurniture && <Navbar />}
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      {mounted && !hideFurniture && <Footer />}
    </>
  )
}
