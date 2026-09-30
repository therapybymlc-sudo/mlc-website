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

export default function TherapyRoom({ 
  roomUrl, 
  onLeave, 
  jwt, 
  appId,
  displayName, 
  subject, 
  sessionDetails 
}) {
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

  const jaasAppId = (appId || process.env.NEXT_PUBLIC_JITSI_APP_ID || "vpaas-magic-cookie-0d29cfbee27644b2ad432cdd4f043406").trim();
  const isJaas = Boolean(jwt && jaasAppId);

  const rawRoom = (roomUrl 
    ? roomUrl.split('/').filter(Boolean).pop() 
    : "mlc-secure-lounge").toLowerCase().replace(/[^a-z0-9_-]/gi, '');
  const cleanId = rawRoom.replace(/^mlc[_-]/i, '');
  const roomName = rawRoom || "mlc-secure-lounge";
  const targetRoom = isJaas ? `${jaasAppId}/${roomName}` : roomName;
  const targetDomain = isJaas ? "8x8.vc" : "meet.jit.si";
  const meetingSubject = subject || (cleanId ? `Virtual Session #${cleanId}` : 'MLC Clinical Consultation');
  
  console.log("🌿 [TherapyRoom] Initializing session:", {
    rawRoom,
    cleanId,
    roomName,
    targetRoom,
    targetDomain,
    isJaas,
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
    
    // Set conference subject once the call has officially started
    jitsiApi.addEventListener('videoConferenceJoined', () => {
      try {
        jitsiApi.executeCommand('subject', meetingSubject);
      } catch (_) {
        /* non-fatal */
      }
    });

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
          domain={targetDomain}
          roomName={targetRoom}
          jwt={jwt || undefined}
          configOverwrite={{
            subject: ' ',
            startWithAudioMuted: false,
            disableModeratorIndicator: false,
            startWithVideoMuted: false,
            enableEmailInStats: false,
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            enableLobby: false,
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

      {/* 🛡️ Clinical Session Details in the Middle (2-3 Lines, Zero Dots) */}
      <Box 
        position="absolute" 
        top={{ base: 3, md: 5 }} 
        left="50%" 
        transform="translateX(-50%)" 
        zIndex={10} 
        maxW={{ base: "calc(100vw - 32px)", sm: "460px" }}
        w="full"
        pointerEvents="none"
      >
        <VStack
          bg="rgba(10, 15, 13, 0.85)" 
          backdropFilter="blur(16px)" 
          px={5} 
          py={2.5} 
          borderRadius="2xl"
          border="1px solid rgba(86, 117, 109, 0.3)"
          boxShadow="0 8px 24px rgba(0,0,0,0.35)"
          spacing={1}
          align="center"
          textAlign="center"
        >
          {/* Line 1: Session Format & Live Status */}
          <HStack spacing={1.5} align="center">
            <Circle size="6px" bg="#10B981" />
            <Text 
              color="#A9CBB7" 
              fontWeight="700" 
              fontSize="10px" 
              letterSpacing="0.08em" 
              textTransform="uppercase"
              fontFamily="'Inter', var(--font-inter), sans-serif"
            >
              {sessionDetails?.session_title?.split('•')[0]?.trim() || "Virtual 1-on-1 Session"}
            </Text>
          </HStack>

          {/* Line 2: Participants */}
          <Text 
            color="white" 
            fontWeight="600" 
            fontSize="13.5px" 
            fontFamily="'Outfit', var(--font-outfit), sans-serif"
            lineHeight="1.25"
          >
            {sessionDetails?.therapist_name && sessionDetails?.client_name
              ? `${sessionDetails.therapist_name} & ${sessionDetails.client_name}`
              : sessionDetails?.session_title || subject || "MLC Clinical Consultation"}
          </Text>

          {/* Line 3: Date & Time */}
          {sessionDetails?.time_str && (
            <Text 
              color="whiteAlpha.750" 
              fontWeight="400" 
              fontSize="11px" 
              fontFamily="'Inter', var(--font-inter), sans-serif"
            >
              {sessionDetails.time_str}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
