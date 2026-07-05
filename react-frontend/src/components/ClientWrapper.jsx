'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { FaWhatsapp } from 'react-icons/fa'

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

      {/* 💬 Premium Fixed WhatsApp Slide-out Widget */}
      {!hideFurniture && (
        <Flex
          as="a"
          href="https://wa.me/919901619968"
          target="_blank"
          rel="noopener noreferrer"
          position="fixed"
          right="0"
          top="65%"
          transform="translateY(-50%)"
          zIndex={9999}
          bg="#25D366"
          color="white"
          h="50px"
          borderLeftRadius="full"
          align="center"
          pl={4}
          pr={5}
          shadow="dark-lg"
          transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          maxW="52px"
          overflow="hidden"
          cursor="pointer"
          _hover={{
            maxW: "220px",
            bg: "#128C7E",
            textDecoration: "none",
            boxShadow: "0 8px 30px rgba(37, 211, 102, 0.4)",
          }}
          style={{ textDecoration: 'none' }}
        >
          <Icon as={FaWhatsapp} boxSize={6} minW="24px" />
          <Text 
            ml={3} 
            fontSize="sm" 
            fontWeight="800" 
            whiteSpace="nowrap" 
            letterSpacing="0.5px"
          >
            Chat on WhatsApp
          </Text>
        </Flex>
      )}
    </>
  )
}
