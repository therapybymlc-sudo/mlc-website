'use client';

import { useEffect } from 'react';
import { Box, Center, Spinner, Text, HStack, VStack, Heading, Circle, Badge, Flex, Icon } from '@chakra-ui/react';
import { FiShield, FiCompass, FiExternalLink } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';

const DiscoveryClient = dynamic(() => import('../../therapists/discovery/DiscoveryClient'), { ssr: false });

export default function AdminTherapistMatchingPage() {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.replace('/admin');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <Center minH="60vh">
        <Spinner color="#56756D" thickness="3px" size="lg" />
      </Center>
    );
  }

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 UNIFIED HERO BANNER (Rule 8 & 10) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={5}
      >
        <Flex 
          direction={{ base: 'column', sm: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', sm: 'center' }}
          gap={4}
        >
          <HStack spacing={3.5} align="center">
            <Circle size="46px" bg="rgba(159, 122, 234, 0.15)" color="#805AD5" flexShrink={0}>
              <Icon as={FiCompass} boxSize="22px" />
            </Circle>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(159, 122, 234, 0.15)" 
                  color="#6B46C1" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  Clinical Operations • Matching Simulator
                </Badge>
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600" 
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Therapist Matching Simulator
              </Heading>
              <Text 
                fontSize="13px" 
                color="#5A6E65" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.4"
              >
                Simulate and audit client intake questionnaires, DASS-21 scoring, and clinical matching.
              </Text>
            </VStack>
          </HStack>
        </Flex>
      </Box>

      {/* Admin Notice Strip */}
      <Box 
        bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" 
        border="1px solid rgba(245, 158, 11, 0.3)" 
        borderRadius="xl" 
        p={3.5} 
        px={5}
        mb={6}
        boxShadow="0 4px 16px -2px rgba(245, 158, 11, 0.12)"
      >
        <HStack spacing={3} justify="center">
          <Icon as={FiShield} color="#D97706" boxSize="15px" flexShrink={0} />
          <Text fontSize="13px" color="#92400E" fontWeight="600" fontFamily="'Inter', var(--font-inter), sans-serif">
            Administrative Testing Sandbox: Full clinician matching questionnaire (hidden from public view).
          </Text>
        </HStack>
      </Box>

      <DiscoveryClient />
    </Box>
  );
}
