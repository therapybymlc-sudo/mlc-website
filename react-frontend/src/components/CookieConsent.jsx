'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Icon,
  Link,
  Portal,
  ScaleFade,
  Circle,
  Badge,
} from '@chakra-ui/react';
import { FiShield, FiCheck } from 'react-icons/fi';
import NextLink from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mlc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }

    const handleShow = () => setIsVisible(true);
    window.addEventListener('mlc-show-cookies', handleShow);
    return () => window.removeEventListener('mlc-show-cookies', handleShow);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mlc_cookie_consent', 'accepted');
    window.dispatchEvent(new Event('mlc-cookie-consent-accepted'));
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
        bottom={{ base: 3, md: 5 }}
        left={{ base: 3, md: 5 }}
        right={{ base: 3, sm: 'auto' }}
        maxW={{ base: 'full', sm: '350px' }}
        w="full"
        zIndex={9999}
        fontFamily="'Inter', var(--font-inter), sans-serif"
      >
        <ScaleFade initialScale={0.94} in={isVisible}>
          <Box
            bg="rgba(255, 255, 255, 0.96)"
            backdropFilter="blur(16px)"
            px={4}
            py={3.5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.16)"
            boxShadow="0 14px 34px -4px rgba(38, 58, 51, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
          >
            <VStack align="stretch" spacing={2.5}>
              {/* Header Row */}
              <HStack justify="space-between" align="center">
                <HStack spacing={2.5} align="center">
                  <Circle size="26px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                    <Icon as={FiShield} boxSize="13px" />
                  </Circle>
                  <Text
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                    fontWeight="600"
                    fontSize="13.5px"
                    color="#263A33"
                    letterSpacing="-0.01em"
                    lineHeight="1.2"
                  >
                    Cookie Privacy
                  </Text>
                </HStack>
                <Badge
                  bg="rgba(86, 117, 109, 0.08)"
                  color="#56756D"
                  fontSize="9px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  MLC Portal
                </Badge>
              </HStack>

              {/* Crisp Short Description */}
              <Text fontSize="12px" color="#5A6E65" lineHeight="1.45">
                We use cookies to maintain secure sessions and remember your clinical preferences. Read our{' '}
                <Link
                  as={NextLink}
                  href="/privacy"
                  color="#56756D"
                  fontWeight="600"
                  textDecoration="underline"
                  _hover={{ color: '#263A33' }}
                >
                  Privacy Policy
                </Link>
                .
              </Text>

              {/* Action Buttons Row */}
              <HStack spacing={2} pt={0.5}>
                <Button
                  flex={1}
                  bg="#56756D"
                  color="white"
                  fontSize="11.5px"
                  fontWeight="600"
                  borderRadius="full"
                  h="32px"
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  onClick={handleAccept}
                  leftIcon={<Icon as={FiCheck} boxSize="12px" />}
                >
                  Accept All
                </Button>
                <Button
                  variant="ghost"
                  fontSize="11.5px"
                  fontWeight="500"
                  color="#5A6E65"
                  h="32px"
                  px={3}
                  borderRadius="full"
                  _hover={{ bg: 'rgba(86, 117, 109, 0.08)', color: '#263A33' }}
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
