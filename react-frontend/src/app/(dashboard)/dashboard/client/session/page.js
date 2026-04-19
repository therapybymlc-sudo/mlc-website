'use client'

import React, { useState, useEffect } from 'react';
import { Box, Container, VStack, Heading, Text, Button, Center, Icon, useToast } from '@chakra-ui/react';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const TherapyRoom = dynamic(() => import('../../../../../components/video/TherapyRoom'), {
  ssr: false,
  loading: () => (
    <Center h="500px" bg="gray.950" borderRadius="3xl">
      <VStack spacing={4}>
        <Spinner color="teal.500" />
        <Text color="whiteAlpha.600" fontSize="xs">Initializing Secure Stream...</Text>
      </VStack>
    </Center>
  )
});

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  // In a real scenario, this would be fetched from the backend based on a session ID
  const roomUrl = searchParams.get('url') || "https://mlchealth.daily.co/demo-room"; 
  const [sessionActive, setSessionActive] = useState(true);

  if (!sessionActive) {
    return (
      <Center h="70vh">
        <VStack spacing={6}>
          <Icon as={FiShield} boxSize={12} color="teal.500" />
          <Heading size="lg" fontFamily="'Playfair Display', serif">Session Ended</Heading>
          <Text color="gray.500">Your clinical session has concluded. Your notes are saved in your dashboard.</Text>
          <Button 
            onClick={() => router.push('/dashboard/client')}
            bg="teal.800" 
            color="white" 
            borderRadius="full"
            px={10}
          >
            Return to Dashboard
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box h="calc(100vh - 120px)">
      <VStack h="full" spacing={6} align="stretch">
        <HStack justify="space-between" mb={2}>
           <Button 
            variant="ghost" 
            leftIcon={<FiArrowLeft />} 
            onClick={() => router.back()}
            color="gray.500"
            _hover={{ bg: 'gray.50' }}
           >
             Exit View
           </Button>
           <HStack>
              <Icon as={FiShield} color="teal.500" />
              <Text fontSize="xs" fontWeight="700" color="teal.700" letterSpacing="1px">END-TO-END ENCRYPTED</Text>
           </HStack>
        </HStack>

        <Box flex="1" overflow="hidden" boxShadow="2xl" borderRadius="3xl">
           <TherapyRoom 
            roomUrl={roomUrl} 
            onLeave={() => {
              toast({ title: "Session Concluded", status: "info" });
              setSessionActive(false);
            }} 
           />
        </Box>
      </VStack>
    </Box>
  );
}

const HStack = ({ children, ...props }) => (
  <Box display="flex" flexDirection="row" {...props}>
    {children}
  </Box>
);
