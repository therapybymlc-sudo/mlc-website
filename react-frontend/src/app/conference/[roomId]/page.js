'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Spinner, Center, VStack, Heading, Text, Button } from '@chakra-ui/react';
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
  const {
    isTherapist,
    isClient,
    isAuthenticated,
    loading: authLoading,
    user,
    therapistProfile,
    clientProfile,
  } = useAuth();
  const roomId = params.roomId;
  const normalizedRoomId = String(roomId || "").toLowerCase();
  
  const [jwt, setJwt] = useState(null);
  const [jitsiDisplayName, setJitsiDisplayName] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!normalizedRoomId) {
      setTokenLoading(false);
      return;
    }
    if (!isAuthenticated) {
      setTokenLoading(false);
      return;
    }
    // Wait until role resolution stabilizes so we don't call the wrong endpoint first.
    if (!isTherapist && !isClient) return;

    const normalizeDetail = (raw) => {
      if (!raw) return "";
      if (typeof raw === "string") return raw;
      if (typeof raw === "object") {
        if (typeof raw.detail === "string") return raw.detail;
        try {
          return JSON.stringify(raw);
        } catch (_e) {
          return "";
        }
      }
      return String(raw);
    };

    const fetchToken = async () => {
      setTokenError(null);
      try {
        const endpoint = isTherapist ? 'therapists' : 'clients';
        const res = await apiGet(`${endpoint}/jitsi-token/?room=${normalizedRoomId}`);
        if (res?.token) {
          setJwt(res.token);
        } else {
          setTokenError('Could not issue a secure video token.');
        }
        if (res?.display_name) {
          setJitsiDisplayName(res.display_name);
        }
      } catch (err) {
        console.error("Failed to fetch Jitsi token:", err);
        const detail = normalizeDetail(err.response?.data?.detail || err.response?.data);
        const code = err.response?.data?.code;
        if (err.response?.status === 403 && (code === 'session_room_closed' || detail)) {
          setTokenError(detail || 'This video room is not open yet.');
        } else {
          setTokenError(detail || 'Could not start the video session. Please try again from your dashboard.');
        }
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, [normalizedRoomId, isTherapist, isClient, isAuthenticated, authLoading]);

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

  if (!isAuthenticated) {
    return (
      <Center h="100vh" bg="gray.950" px={6}>
        <VStack spacing={6} maxW="md" textAlign="center">
          <Heading size="md" color="white">Sign in required</Heading>
          <Text color="whiteAlpha.700" fontSize="sm">
            Please sign in with the same account you use for MLC, then open the session link again.
          </Text>
          <Button colorScheme="teal" borderRadius="full" onClick={() => router.push('/login')}>
            Go to sign in
          </Button>
        </VStack>
      </Center>
    );
  }

  if (tokenError) {
    return (
      <Center h="100vh" bg="gray.950" px={6}>
        <VStack spacing={6} maxW="lg" textAlign="center">
          <Heading size="md" color="white">Session not available</Heading>
          <Text color="whiteAlpha.800" fontSize="sm">
            {tokenError}
          </Text>
          <Button variant="outline" colorScheme="teal" borderRadius="full" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </VStack>
      </Center>
    );
  }

  const fallbackDisplayName =
    therapistProfile?.name ||
    clientProfile?.name ||
    user?.fullName ||
    (user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress.split("@")[0]
      : null);

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
        displayName={jitsiDisplayName || fallbackDisplayName}
      />
    </Box>
  );
}
