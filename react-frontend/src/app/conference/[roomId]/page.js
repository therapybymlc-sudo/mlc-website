'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Spinner, Center, VStack, Heading, Text } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiGet } from '../../../api.js';

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
  const { isTherapist, isClient, isAuthenticated, loading: authLoading } = useAuth();
  const roomId = params.roomId;
  
  const [jwt, setJwt] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setTokenLoading(false);
      return;
    }

    const fetchToken = async () => {
      try {
        const endpoint = isTherapist ? 'therapists' : 'clients';
        const res = await apiGet(`${endpoint}/jitsi-token/`, { room: roomId });
        if (res?.token) {
          setJwt(res.token);
        }
      } catch (err) {
        console.error("Failed to fetch Jitsi token:", err);
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, [roomId, isTherapist, isClient, isAuthenticated, authLoading]);

  if (authLoading || tokenLoading) {
    return (
      <Center h="100vh" bg="gray.950">
        <VStack spacing={6}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text color="whiteAlpha.700" fontFamily="'Playfair Display', serif">Authenticating Session...</Text>
        </VStack>
      </Center>
    );
  }

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
    router.push('/');
  };

  return (
    <Box h="100vh" w="100vw" bg="black">
      <TherapyRoom 
        roomUrl={`https://mlchealth.in/conference/${roomId}`} 
        onLeave={handleLeave}
        jwt={jwt}
      />
    </Box>
  );
}
