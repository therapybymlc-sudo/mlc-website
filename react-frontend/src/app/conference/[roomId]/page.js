'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Spinner, Center, VStack, Heading, Text } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';

const TherapyRoom = dynamic(() => import('../../../components/video/TherapyRoom'), {
  ssr: false,
  loading: () => (
    <Center h="100vh" bg="gray.950">
      <VStack spacing={6}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text color="whiteAlpha.700" fontFamily="'Playfair Display', serif">Preparing Secure Sanctuary...</Text>
      </VStack>
    </Center>
  )
});

export default function ConferencePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId;

  if (!roomId) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Heading size="md" color="gray.600">Invalid Meeting Link</Heading>
          <Text color="gray.500">Please return to your dashboard and join again.</Text>
        </VStack>
      </Center>
    );
  }

  const handleLeave = () => {
    // Redirect to home or dashboard after leaving
    router.push('/');
  };

  return (
    <Box h="100vh" w="100vw" bg="black">
      <TherapyRoom 
        roomUrl={`https://mlchealth.in/conference/${roomId}`} 
        onLeave={handleLeave}
      />
    </Box>
  );
}
