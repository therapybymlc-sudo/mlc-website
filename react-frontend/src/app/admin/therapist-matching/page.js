'use client';

import { useEffect } from 'react';
import { Box, Center, Heading, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
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
        <Spinner color="teal.500" />
      </Center>
    );
  }

  return (
    <Box>
      <Box bg="orange.50" borderBottom="1px solid" borderColor="orange.100" py={3} px={6} textAlign="center">
        <Text fontSize="sm" color="orange.800" fontWeight="600">
          Admin only — full therapist matching quiz (hidden from public). Public users see the manual intake form.
        </Text>
      </Box>
      <DiscoveryClient />
    </Box>
  );
}
