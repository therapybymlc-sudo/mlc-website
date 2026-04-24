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
import { JitsiMeeting } from '@jitsi/react-sdk';

export default function TherapyRoom({ roomUrl, onLeave, jwt }) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // JaaS Naming Convention: AppID/RoomName
  const JAAS_APP_ID = "vpaas-magic-cookie-0d29cfbee27644b2ad432cdd4f043406";
  const rawRoom = (roomUrl 
    ? roomUrl.split('/').filter(Boolean).pop() 
    : "MLC-Secure-Lounge").toLowerCase();
  const roomName = `${JAAS_APP_ID}/${rawRoom}`;
  
  console.log("🌿 [TherapyRoom] Initializing session:", {
    rawRoom,
    roomName,
    appId: JAAS_APP_ID,
    hasJwt: !!jwt
  });

  const handleApiReady = (jitsiApi) => {
    setApi(jitsiApi);
    setLoading(false);

    // Custom clinical setup
    jitsiApi.executeCommand('subject', 'MLC Secure Clinical Session');
    
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
                <Heading size="md" color="white" fontFamily="'Playfair Display', serif">Initializing Secure Sanctuary...</Heading>
                <Text color="whiteAlpha.600" fontSize="sm">Secure Clinical Protocol Active</Text>
              </VStack>
           </VStack>
        </Center>
      )}

      <Box h="full" w="full">
        <JitsiMeeting
          domain="8x8.vc"
          appId="vpaas-magic-cookie-0d29cfbee27644b2ad432cdd4f043406"
          roomName={roomName}
          jwt={jwt}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startWithVideoMuted: true,
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
            displayName: 'MLC Participant'
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
