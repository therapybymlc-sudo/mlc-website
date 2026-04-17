'use client'

import { Box, Heading, Text, VStack, SimpleGrid, Icon, Button, Badge } from "@chakra-ui/react";
import { FiBook, FiFolder, FiExternalLink, FiShare2 } from "react-icons/fi";

const RESOURCES = [
  { title: "Clinical Guidelines 2024", type: "PDF", category: "Standard" },
  { title: "Client Assessment Template", type: "DOCX", category: "Forms" },
  { title: "Therapeutic Alliance Primer", type: "VIDEO", category: "Education" },
  { title: "Crisis Intervention Flowchart", type: "IMAGE", category: "Emergency" },
];

export default function TherapistResourcesClient() {
  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Resource Library
        </Heading>
        <Text color="gray.500">Access clinical tools, templates, and organizational resources.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {RESOURCES.map((res, i) => (
          <Box key={i} bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="0.3s">
            <VStack align="start" spacing={3}>
              <Box p={3} bg="rgba(86, 117, 109, 0.1)" borderRadius="2xl">
                <Icon as={FiBook} color="#56756D" boxSize={6} />
              </Box>
              <VStack align="start" spacing={0}>
                <Badge variant="subtle" colorScheme="teal" mb={2}>{res.category}</Badge>
                <Heading size="sm" color="#2E2E2E">{res.title}</Heading>
                <Text fontSize="xs" color="gray.400" mt={1}>{res.type} Document</Text>
              </VStack>
              <Button size="sm" variant="ghost" rightIcon={<FiExternalLink />} colorScheme="teal" w="100%" justifyContent="space-between">Download</Button>
            </VStack>
          </Box>
        ))}
        
        <VStack 
          justify="center" 
          p={6} 
          borderRadius="3xl" 
          border="2px dashed" 
          borderColor="gray.200"
          cursor="pointer"
          _hover={{ bg: 'gray.50' }}
        >
          <Icon as={FiShare2} boxSize={8} color="gray.300" mb={2} />
          <Text fontWeight="600" color="gray.400">Upload New Resource</Text>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
