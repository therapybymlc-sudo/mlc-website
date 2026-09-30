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
        <Spinner size="xl" color="#6B8B7B" thickness="4px" />
        <Text color="whiteAlpha.800" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" fontSize="15px">Preparing Secure Session Room...</Text>
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
  const apptNum = normalizedRoomId.match(/\d+/)?.[0];
  
  const [jwt, setJwt] = useState(null);
  const [jitsiDisplayName, setJitsiDisplayName] = useState(null);
  const [sessionSubject, setSessionSubject] = useState(
    apptNum ? `Virtual Session #${apptNum} • MLC Clinical Consultation` : 'MLC Virtual Clinical Session'
  );
  const [sessionDetails, setSessionDetails] = useState(null);
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

    const fetchToken = async () => {
      setTokenError(null);
      try {
        const endpoint = isTherapist ? 'therapists' : 'clients';
        const res = await apiGet(`${endpoint}/jitsi-token/?room=${normalizedRoomId}`);
        if (res?.token) {
          setJwt(res.token);
        }
        if (res?.subject) {
          setSessionSubject(res.subject);
        }
        if (res?.session_details) {
          setSessionDetails(res.session_details);
        }
        if (res?.display_name) {
          setJitsiDisplayName(res.display_name);
        } else {
          setJitsiDisplayName(therapistProfile?.name || clientProfile?.name || user?.fullName || 'MLC Participant');
        }
      } catch (err) {
        console.warn("Jitsi token probe (Option B standard mode active):", err);
        // Option B is the active conferencing mode (standard meet.jit.si room)
        // If JWT generation is unavailable or restricted by time window,
        // proceed directly to standard secure room instead of blocking the user
        setJitsiDisplayName(therapistProfile?.name || clientProfile?.name || user?.fullName || 'MLC Participant');
        if (apptNum) {
          try {
            const apptRes = isTherapist 
              ? await apiGet(`appointments/${apptNum}/`)
              : await apiGet(`client-appointments/${apptNum}/`);
            if (apptRes) {
              const th = apptRes.therapist_name || 'Therapist';
              const cl = apptRes.client_name || apptRes.client_display_name || 'Client';
              const timeStr = apptRes.start_time 
                ? new Date(apptRes.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '';
              const subj = timeStr 
                ? `Virtual Session: ${th} & ${cl} (${timeStr})`
                : `Virtual Session: ${th} & ${cl}`;
              setSessionSubject(subj);
              setSessionDetails({
                session_title: `Virtual 1-on-1 Session • ${th}`,
                therapist_name: th,
                client_name: cl,
                time_str: timeStr,
                appointment_id: apptRes.id,
              });
            }
          } catch (apptErr) {
            console.debug("Appointment fallback not available:", apptErr);
          }
        }
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, [normalizedRoomId, isTherapist, isClient, isAuthenticated, authLoading, apptNum, therapistProfile?.name, clientProfile?.name, user?.fullName]);

  if (authLoading || tokenLoading) {
    return (
      <Center h="100vh" bg="gray.950">
        <VStack spacing={6}>
          <Spinner size="xl" color="#6B8B7B" thickness="4px" />
          <Text color="whiteAlpha.800" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" fontSize="15px">Connecting to Video Session...</Text>
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
          <Heading size="md" color="rgba(46,46,46,0.75)">Invalid Meeting Link</Heading>
          <Text color="rgba(46,46,46,0.6)">Please return to your dashboard and join again.</Text>
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
        subject={sessionSubject}
        sessionDetails={sessionDetails}
      />
    </Box>
  );
}
