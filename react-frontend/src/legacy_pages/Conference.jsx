import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Spinner, Center, VStack, Text, Heading } from '@chakra-ui/react';
import TherapyRoom from '../components/video/TherapyRoom';

export default function Conference() {
  const { roomId } = useParams();
  const navigate = useNavigate();

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
    navigate('/');
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
