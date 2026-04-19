'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Collapse,
  useDisclosure,
  Icon,
  Link,
  Portal,
  ScaleFade
} from '@chakra-ui/react';
import { FiShield, FiInfo, FiCheck } from 'react-icons/fi';
import NextLink from 'next/link';

export default function CookieConsent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mlc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }

    const handleShow = () => setIsVisible(true);
    window.addEventListener('mlc-show-cookies', handleShow);
    return () => window.removeEventListener('mlc-show-cookies', handleShow);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mlc_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('mlc_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        bottom={{ base: 4, md: 8 }}
        left={{ base: 4, md: 8 }}
        right={{ base: 4, md: 'auto' }}
        maxW={{ base: "full", md: "420px" }}
        zIndex={9999}
      >
        <ScaleFade initialScale={0.9} in={isVisible}>
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            shadow="2xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3}>
                <Box p={2} bg="teal.50" borderRadius="lg" color="teal.600">
                  <Icon as={FiShield} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="800" fontSize="sm" color="gray.800">Cookie Privacy</Text>
                  <Text fontSize="xs" color="gray.500">How we use data</Text>
                </VStack>
              </HStack>

              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                We use cookies to enhance your clinical portal experience, remember your preferences, and ensure secure authentication. By continuing, you agree to our <Link as={NextLink} href="/privacy" color="teal.500" fontWeight="600">Privacy Policy</Link>.
              </Text>

              <HStack spacing={3} pt={2}>
                <Button 
                  flex={1}
                  bg="teal.800" 
                  color="white" 
                  fontSize="xs"
                  borderRadius="full"
                  h={10}
                  _hover={{ bg: "teal.900" }}
                  onClick={handleAccept}
                  leftIcon={<Icon as={FiCheck} />}
                >
                  Accept All
                </Button>
                <Button 
                  variant="ghost"
                  fontSize="xs"
                  color="gray.500"
                  h={10}
                  borderRadius="full"
                  onClick={handleDecline}
                >
                  Essential Only
                </Button>
              </HStack>
            </VStack>
          </Box>
        </ScaleFade>
      </Box>
    </Portal>
  );
}
