'use client'

import { Box, Heading, Text, VStack, SimpleGrid, Icon, Button, Badge, HStack, Spinner } from "@chakra-ui/react";
import { FiBook, FiExternalLink, FiShare2, FiClipboard } from "react-icons/fi";
import { useEffect, useState } from "react";
import TherapistSubscriptionGateway from "../../../../../components/TherapistSubscriptionGateway";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";
import { resourcesApi } from "../../../../../api/resources";
import { useRouter } from "next/navigation";

const RESOURCES = [
  { title: "Clinical Guidelines 2024", type: "PDF", category: "Standard" },
  { title: "Client Assessment Template", type: "DOCX", category: "Forms" },
  { title: "Therapeutic Alliance Primer", type: "VIDEO", category: "Education" },
  { title: "Crisis Intervention Flowchart", type: "IMAGE", category: "Emergency" },
];

export default function TherapistResourcesClient() {
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const payload = await resourcesApi.listAssessmentCatalog();
        if (!cancelled) setAssessments(payload?.assessments || []);
      } catch (_err) {
        if (!cancelled) setAssessments([]);
      } finally {
        if (!cancelled) setLoadingAssessments(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Resource Library
        </Heading>
        <Text color="gray.500">Access clinical tools, templates, and organizational resources.</Text>
      </VStack>

      {!hasBasicAccess && (
        <Box mb={6} p={4} borderRadius="xl" border="1px solid" borderColor="orange.200" bg="orange.50">
          <Text fontSize="sm" color="orange.800" fontWeight="600">
            Resource library is visible in preview mode. Activate Basic to download and upload resources.
          </Text>
          <Button size="sm" mt={3} colorScheme="orange" borderRadius="full" onClick={() => requireBasicAccess()}>
            Activate to unlock
          </Button>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} opacity={hasBasicAccess ? 1 : 0.8}>
        <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <VStack align="start" spacing={3}>
            <Box p={3} bg="rgba(86, 117, 109, 0.1)" borderRadius="2xl">
              <Icon as={FiClipboard} color="#56756D" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0} w="100%">
              <Badge variant="subtle" colorScheme="purple" mb={2}>Assessments</Badge>
              <Heading size="sm" color="#2E2E2E">Self-Report Assessment Library</Heading>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Assign evidence-based assessments to clients from their client file.
              </Text>
            </VStack>
            {loadingAssessments ? (
              <HStack spacing={2}><Spinner size="sm" color="teal.500" /><Text fontSize="xs">Loading assessments...</Text></HStack>
            ) : (
              <VStack align="start" spacing={2} w="100%">
                {assessments.length === 0 ? (
                  <Text fontSize="xs" color="gray.500">No assessments available yet.</Text>
                ) : (
                  assessments.slice(0, 4).map((item) => (
                    <Box key={item.id} w="100%" p={2} borderRadius="lg" bg="gray.50">
                      <Text fontSize="xs" fontWeight="700">{item.name}</Text>
                      <Text fontSize="2xs" color="gray.500">{item.abbreviation} • {item.completionTime}</Text>
                    </Box>
                  ))
                )}
              </VStack>
            )}
            <Button
              size="sm"
              colorScheme="purple"
              w="100%"
              borderRadius="full"
              onClick={() => router.push("/dashboard/therapist/clients")}
            >
              Assign from Client File
            </Button>
          </VStack>
        </Box>

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
              <Button size="sm" variant="ghost" rightIcon={<FiExternalLink />} colorScheme="teal" w="100%" justifyContent="space-between" onClick={() => requireBasicAccess()}>
                Download
              </Button>
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
          onClick={() => requireBasicAccess()}
        >
          <Icon as={FiShare2} boxSize={8} color="gray.300" mb={2} />
          <Text fontWeight="600" color="gray.400">Upload New Resource</Text>
        </VStack>
      </SimpleGrid>
      <TherapistSubscriptionGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate Basic to use the therapist resource library and go fully paperless."
      />
    </Box>
  );
}
