'use client';

import { Box, Heading, Text, VStack, Badge, Icon, HStack } from "@chakra-ui/react";
import { FiLock, FiMessageSquare, FiShield } from "react-icons/fi";

export default function MessagesComingSoonClient() {
  return (
    <Box maxW="980px" mx="auto" pb={16}>
      <Box
        bg="white"
        borderRadius="3xl"
        border="1px solid"
        borderColor="gray.100"
        shadow="sm"
        p={{ base: 8, md: 12 }}
      >
        <VStack align="start" spacing={6}>
          <Badge bg="teal.50" color="teal.700" px={4} py={1.5} borderRadius="full">
            COMING SOON
          </Badge>

          <VStack align="start" spacing={3}>
            <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">
              Secure Messaging Is On The Way
            </Heading>
            <Text color="gray.600" fontSize="md" lineHeight="tall">
              Stay tuned for an encrypted therapist-client communication suite built for clinical excellence.
              Soon, you will be able to coordinate care, share updates, and manage therapeutic conversations
              without ever exposing your personal phone number.
            </Text>
            <Text color="gray.600" fontSize="md" lineHeight="tall">
              Everything will live inside one protected workspace, so your notes, task flow, communication,
              and continuity of care remain private, professional, and beautifully organized.
            </Text>
          </VStack>

          <HStack spacing={4} flexWrap="wrap" pt={1}>
            <HStack bg="gray.50" px={4} py={2} borderRadius="full">
              <Icon as={FiLock} color="teal.600" />
              <Text fontSize="sm" color="gray.700" fontWeight="600">End-to-end encrypted chat</Text>
            </HStack>
            <HStack bg="gray.50" px={4} py={2} borderRadius="full">
              <Icon as={FiShield} color="teal.600" />
              <Text fontSize="sm" color="gray.700" fontWeight="600">Privacy-first clinician identity protection</Text>
            </HStack>
            <HStack bg="gray.50" px={4} py={2} borderRadius="full">
              <Icon as={FiMessageSquare} color="teal.600" />
              <Text fontSize="sm" color="gray.700" fontWeight="600">Unified communication and care workflow</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
