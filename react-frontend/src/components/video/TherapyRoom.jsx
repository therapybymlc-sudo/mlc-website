'use client'

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  IconButton,
  Text,
  useToast,
  Center,
  Spinner,
  Heading,
  Circle,
  Icon,
  Tooltip,
  Button
} from '@chakra-ui/react';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, 
  FiMaximize, FiSettings, FiMessageSquare, FiShield 
} from 'react-icons/fi';
import DailyIframe from '@daily-co/daily-js';
import { 
  DailyProvider, 
  useDaily, 
  useLocalParticipant, 
  useParticipantIds, 
  useMediaTrack,
  DailyVideo
} from '@daily-co/daily-react';

// --- Inner Component (Session) ---
function VideoSession({ onLeave }) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds();
  const toast = useToast();

  const isMicEnabled = localParticipant?.audio;
  const isVideoEnabled = localParticipant?.video;

  const toggleAudio = useCallback(() => {
    daily.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const toggleVideo = useCallback(() => {
    daily.setLocalVideo(!isVideoEnabled);
  }, [daily, isVideoEnabled]);

  const leaveCall = useCallback(() => {
    daily.leave();
    onLeave && onLeave();
  }, [daily, onLeave]);

  return (
    <Box h="full" w="full" bg="gray.950" position="relative" overflow="hidden" borderRadius="3xl">
      {/* 📹 Main Stage (Remote Participants) */}
      <Box h="full" w="full">
        {participantIds.length <= 1 ? (
          <Center h="full" w="full">
            <VStack spacing={6}>
              <Box position="relative">
                 <Spinner size="xl" thickness="4px" color="teal.500" speed="0.8s" />
                 <Icon as={FiShield} position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" color="teal.500" />
              </Box>
              <VStack spacing={1}>
                <Heading size="md" color="white" fontFamily="'Playfair Display', serif">Waiting for your therapist...</Heading>
                <Text color="whiteAlpha.600" fontSize="sm">Your connection is encrypted and private.</Text>
              </VStack>
            </VStack>
          </Center>
        ) : (
          <Flex direction="column" h="full">
             {/* Simple grid for now, would scale for more */}
             {participantIds.filter(id => id !== localParticipant?.session_id).map((id) => (
                <Box key={id} flex="1" position="relative">
                   <DailyVideo id={id} automirror style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <Box position="absolute" bottom={4} left={4} bg="blackAlpha.700" px={3} py={1} borderRadius="full">
                      <Text color="white" fontSize="xs" fontWeight="700">THERAPIST</Text>
                   </Box>
                </Box>
             ))}
          </Flex>
        )}
      </Box>

      {/* 👤 Self View (Floating) */}
      <Box 
        position="absolute" 
        top={6} 
        right={6} 
        w={{ base: "120px", md: "200px" }} 
        h={{ base: "160px", md: "150px" }} 
        bg="gray.800" 
        borderRadius="2xl" 
        overflow="hidden"
        boxShadow="2xl"
        border="2px solid"
        borderColor="whiteAlpha.200"
      >
        {localParticipant && (
          <DailyVideo id={localParticipant.session_id} automirror style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {!isVideoEnabled && (
           <Center position="absolute" inset={0} bg="gray.800">
              <Icon as={FiVideoOff} color="whiteAlpha.400" boxSize={6} />
           </Center>
        )}
      </Box>

      {/* 🎮 Controls Bar */}
      <Box 
        position="absolute" 
        bottom={8} 
        left="50%" 
        transform="translateX(-50%)"
        bg="rgba(10, 10, 10, 0.8)"
        backdropFilter="blur(20px)"
        px={8}
        py={4}
        borderRadius="full"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      >
        <HStack spacing={6}>
          <Tooltip label={isMicEnabled ? "Mute Mic" : "Unmute Mic"}>
            <IconButton
              icon={isMicEnabled ? <FiMic /> : <FiMicOff />}
              onClick={toggleAudio}
              variant={isMicEnabled ? "ghost" : "solid"}
              colorScheme={isMicEnabled ? "whiteAlpha" : "red"}
              borderRadius="full"
              color={isMicEnabled ? "white" : "white"}
            />
          </Tooltip>

          <Tooltip label={isVideoEnabled ? "Stop Video" : "Start Video"}>
            <IconButton
              icon={isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
              onClick={toggleVideo}
              variant={isVideoEnabled ? "ghost" : "solid"}
              colorScheme={isVideoEnabled ? "whiteAlpha" : "red"}
              borderRadius="full"
              color={isVideoEnabled ? "white" : "white"}
            />
          </Tooltip>

          <Divider orientation="vertical" h="30px" borderColor="whiteAlpha.300" />

          <Tooltip label="Settings">
            <IconButton icon={<FiSettings />} variant="ghost" color="whiteAlpha.700" borderRadius="full" />
          </Tooltip>

          <Tooltip label="Leave Session">
            <Button
              leftIcon={<FiPhoneOff />}
              colorScheme="red"
              borderRadius="full"
              px={8}
              onClick={leaveCall}
            >
              End Session
            </Button>
          </Tooltip>
        </HStack>
      </Box>

      {/* 🏷️ Logo Branding */}
      <Box position="absolute" top={6} left={8}>
         <HStack spacing={2}>
            <Circle size={2} bg="teal.400" />
            <Text color="white" fontWeight="900" fontSize="xs" letterSpacing="0.2em">MLC SECURE SESSION</Text>
         </HStack>
      </Box>
    </Box>
  );
}

// --- Main Export (Provider Wrapper) ---
export default function TherapyRoom({ roomUrl, token, onLeave }) {
  const [callObject, setCallObject] = useState(null);

  useEffect(() => {
    if (!roomUrl || callObject) return;

    const co = DailyIframe.createCallObject();
    co.join({ url: roomUrl, token: token || undefined });
    setCallObject(co);

    return () => {
      co.destroy();
    };
  }, [roomUrl, token]);

  if (!roomUrl) {
    return (
      <Center h="500px" bg="gray.50" borderRadius="3xl" border="2px dashed" borderColor="gray.200">
         <VStack spacing={4}>
            <Icon as={FiShield} boxSize={10} color="gray.300" />
            <Text color="gray.500">Waiting for a valid session link...</Text>
         </VStack>
      </Center>
    );
  }

  if (!callObject) {
    return (
      <Center h="500px" bg="gray.950" borderRadius="3xl">
         <Spinner color="teal.500" />
      </Center>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <VideoSession onLeave={onLeave} />
    </DailyProvider>
  );
}
