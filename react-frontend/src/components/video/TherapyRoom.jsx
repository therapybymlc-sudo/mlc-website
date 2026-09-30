'use client'

import React, { useRef, useState } from 'react';
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

export default function TherapyRoom({ roomUrl, onLeave, jwt, displayName }) {
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
  const roomName = `mlc-session-${rawRoom || "lounge"}`;
  
  console.log("🌿 [TherapyRoom] Initializing session (Option B Jitsi):", {
    rawRoom,
    roomName,
    domain: "meet.jit.si",
    hasJwt: !!jwt
  });

  const handleApiReady = (jitsiApi) => {
    setApi(jitsiApi);
    setLoading(false);

    // Custom clinical setup
    jitsiApi.executeCommand('subject', 'MLC Secure Clinical Session');
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
      <Box 
        position="absolute" 
        top={4} 
        left={6} 
        zIndex={5} 
        bg="rgba(0,0,0,0.5)" 
        backdropFilter="blur(10px)" 
        px={4} 
        py={2} 
        borderRadius="full"
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
         <HStack spacing={2}>
            <Icon as={FiLock} color="teal.400" boxSize={3} />
            <Text color="white" fontWeight="900" fontSize="10px" letterSpacing="0.1em">MLC SECURE SESSION</Text>
         </HStack>
      </Box>
    </Box>
  );
}
