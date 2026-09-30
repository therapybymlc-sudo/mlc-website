'use client'

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Center,
  Spinner,
  Text,
  Heading,
  Icon,
  Circle,
  HStack
} from '@chakra-ui/react';
import { FiShield, FiLock } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((mod) => mod.JitsiMeeting),
  { 
    ssr: false, 
    loading: () => (
      <Center py={16}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
      </Center>
    ) 
  }
);

export default function TherapyRoom({ roomUrl, onLeave, jwt, displayName, subject, sessionDetails }) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!api) return;
    const name = (displayName && String(displayName).trim()) || '';
    if (!name) return;
    try {
      api.executeCommand('displayName', name);
    } catch (_) {
      /* non-fatal */
    }
  }, [api, displayName]);

  // Standard Jitsi Room (Option B - Free, no paid 8x8 JaaS keys required)
  const rawRoom = (roomUrl 
    ? roomUrl.split('/').filter(Boolean).pop() 
    : "MLC-Secure-Lounge").toLowerCase().replace(/[^a-z0-9_-]/gi, '');
  const cleanId = rawRoom.replace(/^mlc[_-]/i, '');
  const roomName = `mlc-consultation-${cleanId || "room"}`;
  const meetingSubject = subject || (cleanId ? `Virtual Session #${cleanId}` : 'MLC Clinical Consultation');
  
  console.log("🌿 [TherapyRoom] Initializing session (Option B Jitsi):", {
    rawRoom,
    cleanId,
    roomName,
    meetingSubject,
    domain: "meet.jit.si",
    hasJwt: !!jwt
  });

  const handleApiReady = (jitsiApi) => {
    setApi(jitsiApi);
    setLoading(false);

    // Custom clinical setup
    jitsiApi.executeCommand('subject', meetingSubject);
    const name = (displayName && String(displayName).trim()) || '';
    if (name) {
      try {
        jitsiApi.executeCommand('displayName', name);
      } catch (_) {
        /* non-fatal */
      }
    }
    
    // Add listeners with a small guard to prevent "Double Exit" on login redirects
    jitsiApi.addEventListener('videoConferenceLeft', () => {
      // Small delay prevents the "Session Concluded" screen from appearing
      // during the internal redirect when a user clicks "Log In"
      setTimeout(() => {
        if (onLeave) onLeave();
      }, 1000);
    });
  };

  if (!isMounted) return null;

  if (!roomUrl && !loading) {
     return (
      <Center h="500px" bg="gray.50" borderRadius="3xl" border="2px dashed" borderColor="gray.200">
         <VStack spacing={4}>
            <Icon as={FiShield} boxSize={10} color="gray.300" />
            <Text color="gray.500">Waiting for a valid clinical link...</Text>
         </VStack>
      </Center>
    );
  }

  return (
    <Box h="full" w="full" bg="gray.950" position="relative" overflow="hidden" borderRadius="3xl">
      {loading && (
        <Center position="absolute" inset={0} zIndex={10} bg="gray.950">
           <VStack spacing={6}>
              <Box position="relative">
                 <Spinner size="xl" thickness="4px" color="teal.500" speed="0.8s" />
                 <Icon as={FiShield} position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" color="teal.500" />
              </Box>
              <VStack spacing={1}>
                <Heading size="md" color="white" fontFamily="'Outfit', sans-serif">Initializing Secure Session...</Heading>
                <Text color="whiteAlpha.600" fontSize="sm">End-to-End Secure Clinical Protocol</Text>
              </VStack>
           </VStack>
        </Center>
      )}

      <Box h="full" w="full">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          jwt={jwt || undefined}
          configOverwrite={{
            subject: meetingSubject,
            startWithAudioMuted: false,
            disableModeratorIndicator: false,
            startWithVideoMuted: false,
            enableEmailInStats: false,
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            enableE2EP: true, // End-to-end encryption for security
            toolbarButtons: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'hangup', 'profile', 'chat', 'settings',
              'videoquality', 'tileview', 'select-background',
            ],
          }}
          interfaceConfigOverwrite={{
            DEFAULT_BACKGROUND: '#0A0A0A',
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
            BRAND_WATERMARK_LINK: '',
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            DISPLAY_WELCOME_FOOTER: false,
            RECENT_LIST_ENABLED: false,
          }}
          userInfo={{
            displayName: (displayName && String(displayName).trim()) || 'MLC Participant',
          }}
          onApiReady={handleApiReady}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </Box>

      {/* 🛡️ Secure Session Badge */}
      <HStack 
        position="absolute" 
        top={4} 
        left={6} 
        zIndex={5} 
        spacing={2.5}
        maxW="calc(100vw - 48px)"
      >
        <HStack
          bg="rgba(10, 15, 13, 0.75)" 
          backdropFilter="blur(16px)" 
          px={3.5} 
          py={1.5} 
          borderRadius="full"
          border="1px solid rgba(86, 117, 109, 0.3)"
          boxShadow="0 4px 12px rgba(0,0,0,0.25)"
          spacing={2}
        >
          <Circle size="7px" bg="#10B981" />
          <Text color="white" fontWeight="700" fontSize="10.5px" letterSpacing="0.08em" textTransform="uppercase">
            {sessionDetails?.session_title || "MLC SECURE SESSION"}
          </Text>
        </HStack>

        {(sessionDetails?.therapist_name || sessionDetails?.time_str || subject) && (
          <HStack
            bg="rgba(10, 15, 13, 0.7)" 
            backdropFilter="blur(16px)" 
            px={3.5} 
            py={1.5} 
            borderRadius="full"
            border="1px solid rgba(255, 255, 255, 0.12)"
            boxShadow="0 4px 12px rgba(0,0,0,0.2)"
            spacing={2}
            display={{ base: "none", sm: "flex" }}
          >
            <Text color="whiteAlpha.900" fontWeight="500" fontSize="11px">
              {sessionDetails?.therapist_name && sessionDetails?.client_name
                ? `${sessionDetails.therapist_name} & ${sessionDetails.client_name}`
                : subject}
            </Text>
            {sessionDetails?.time_str && (
              <>
                <Box w="1px" h="10px" bg="whiteAlpha.400" />
                <Text color="whiteAlpha.700" fontWeight="400" fontSize="10.5px">
                  {sessionDetails.time_str}
                </Text>
              </>
            )}
          </HStack>
        )}
      </HStack>
    </Box>
  );
}
