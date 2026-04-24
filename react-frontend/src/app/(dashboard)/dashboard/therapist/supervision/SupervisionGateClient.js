'use client'

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../../../../../context/AuthContext';
import SupervisionClient from './SupervisionClient';

export default function SupervisionGateClient() {
  const router = useRouter();
  const { therapistProfile, isAdmin } = useAuth();
  const yearsExperience = Number(therapistProfile?.years_experience || 0);
  const canAccessSupervisionSuite = isAdmin || yearsExperience >= 5;

  useEffect(() => {
    if (!canAccessSupervisionSuite) {
      router.replace('/dashboard/therapist/supervisee');
    }
  }, [canAccessSupervisionSuite, router]);

  if (!canAccessSupervisionSuite) {
    return (
      <Center minH="50vh">
        <VStack spacing={3}>
          <Spinner color="mlc.green" />
          <Text color="gray.500">Opening your supervisee workspace...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Suspense fallback={null}>
      <SupervisionClient />
    </Suspense>
  );
}
