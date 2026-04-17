'use client'

import { Box, Heading, Text, VStack, SimpleGrid, Icon, Button, Textarea, HStack, Divider } from "@chakra-ui/react";
import { FiHeart, FiSmile, FiEdit3, FiAnchor } from "react-icons/fi";

export default function TherapistCareClient() {
  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Therapist Care Space
        </Heading>
        <Text color="gray.500">A dedicated environment for your own reflection and clinical well-being.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <HStack mb={6}>
              <Icon as={FiSmile} color="pink.400" boxSize={6} />
              <Heading size="md">Quick Check-in</Heading>
           </HStack>
           <Text color="gray.600" mb={6}>How are you feeling as you step into your practice today?</Text>
           <SimpleGrid columns={3} spacing={3} mb={6}>
              {['Grounded', 'Open', 'Steady', 'Tired', 'Overloaded', 'Resilient'].map(m => (
                <Button key={m} variant="outline" size="sm" borderRadius="full" _hover={{ bg: 'pink.50', borderColor: 'pink.200' }}>{m}</Button>
              ))}
           </SimpleGrid>
           <Textarea placeholder="What is one thing you want to hold gently today?" borderRadius="2xl" rows={3} />
           <Button mt={4} colorScheme="teal" borderRadius="full" w="100%">Save Reflection</Button>
        </Box>

        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <HStack mb={6}>
              <Icon as={FiAnchor} color="blue.400" boxSize={6} />
              <Heading size="md">Anchor Points</Heading>
           </HStack>
           <VStack align="stretch" spacing={4}>
              <Box p={4} bg="blue.50" borderRadius="2xl">
                 <Text fontSize="sm" fontWeight="600">Reflection Prompt:</Text>
                 <Text fontSize="sm" color="gray.600">"What part of your work today felt most meaningful?"</Text>
              </Box>
              <Box p={4} bg="green.50" borderRadius="2xl">
                 <Text fontSize="sm" fontWeight="600">Well-being Reminder:</Text>
                 <Text fontSize="sm" color="gray.600">Remember to take a full 5-minute break between sessions.</Text>
              </Box>
           </VStack>
           <Divider my={6} />
           <Button variant="ghost" leftIcon={<FiEdit3 />} colorScheme="blue">Open Private Journal</Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
