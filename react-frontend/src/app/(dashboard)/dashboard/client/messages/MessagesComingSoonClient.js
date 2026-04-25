'use client';

import { Badge, Box, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
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
              You’ll soon be able to message your therapist in a private, secure communication space
              built directly into your MLC dashboard.
            </Text>
            <Text color="gray.600" fontSize="md" lineHeight="tall">
              This feature is designed to support safe continuity of care without sharing personal
              phone numbers or switching to external apps.
            </Text>
          </VStack>

          <HStack spacing={4} flexWrap="wrap" pt={1}>
            <HStack bg="gray.50" px={4} py={2} borderRadius="full">
              <Icon as={FiLock} color="teal.600" />
              <Text fontSize="sm" color="gray.700" fontWeight="600">Protected chat sessions</Text>
            </HStack>
            <HStack bg="gray.50" px={4} py={2} borderRadius="full">
              <Icon as={FiShield} color="teal.600" />
              <Text fontSize="sm" color="gray.700" fontWeight="600">Privacy-first communication</Text>
            </HStack>
            <HStack bg="gray.50" px={4} py={2} borderRadius="full">
              <Icon as={FiMessageSquare} color="teal.600" />
              <Text fontSize="sm" color="gray.700" fontWeight="600">Therapist-client messaging hub</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
