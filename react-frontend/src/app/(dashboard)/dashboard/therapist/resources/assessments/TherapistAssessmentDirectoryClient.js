'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Heading, HStack, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiArrowLeft, FiClipboard } from "react-icons/fi";
import { resourcesApi } from "../../../../../../api/resources";

export default function TherapistAssessmentDirectoryClient() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const payload = await resourcesApi.listAssessmentCatalog();
        if (!cancelled) setAssessments(payload?.assessments || []);
      } catch (_err) {
        if (!cancelled) setAssessments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <VStack align="start" spacing={2} mb={8}>
        <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => router.push("/dashboard/therapist/resources")}>
          Back to Resources
        </Button>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Assessment Directory
        </Heading>
        <Text color="gray.500">Browse all available assessments and open full content-layer details.</Text>
      </VStack>

      {loading ? (
        <HStack><Spinner size="sm" color="teal.500" /><Text>Loading assessments...</Text></HStack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {assessments.map((item) => (
            <Box
              key={item.id}
              bg="white"
              p={6}
              borderRadius="2xl"
              shadow="sm"
              border="1px solid"
              borderColor="gray.100"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="0.2s"
            >
              <VStack align="start" spacing={3}>
                <Box p={3} bg="rgba(86, 117, 109, 0.1)" borderRadius="xl">
                  <FiClipboard color="#56756D" />
                </Box>
                <Box px={2} py={1} borderRadius="full" bg="purple.50">
                  <Text fontSize="xs" color="purple.700" fontWeight="700">{item.abbreviation}</Text>
                </Box>
                <Heading size="sm">{item.name}</Heading>
                <Text fontSize="xs" color="gray.500">
                  {item.completionTime} • Age {item.ageRange}
                </Text>
                <Button
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                  onClick={() => router.push(`/dashboard/therapist/resources/assessments/${item.id}`)}
                  w="100%"
                >
                  Open assessment details
                </Button>
              </VStack>
            </Box>
          ))}
          {assessments.length === 0 ? (
            <Text color="gray.500">No assessments available.</Text>
          ) : null}
        </SimpleGrid>
      )}
    </Box>
  );
}
