'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, Button, Heading, HStack, SimpleGrid, Spinner, Text, VStack, 
  Circle, Flex, Badge, Divider, Icon 
} from "@chakra-ui/react";
import { FiArrowLeft, FiClipboard, FiList } from "react-icons/fi";
import { resourcesApi } from "../../../../../../api/resources";
import NextLink from "next/link";

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
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiClipboard} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#263A33" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Clinical Practice · Resources
                </Badge>
                <Badge 
                  bg="#ECFDF5" 
                  color="#065F46" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  Assessment Catalog
                </Badge>
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Assessment Directory
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Browse all available standardized assessments, scoring protocols, and clinical domains.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Back Action */}
          <HStack 
            spacing={3} 
            wrap={{ base: 'wrap', sm: 'nowrap' }} 
            w={{ base: 'full', lg: 'auto' }} 
            justify={{ base: 'flex-start', lg: 'flex-end' }}
          >
            <HStack 
              spacing={3} 
              p={1.5} 
              px={2.5}
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
            >
              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiList} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    CATALOG
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {assessments.length}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button
              as={NextLink}
              href="/dashboard/therapist/resources"
              leftIcon={<FiArrowLeft />}
              variant="outline"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              borderRadius="full"
              h="38px"
              fontSize="12.5px"
              fontWeight="600"
              px={4}
              whiteSpace="nowrap"
              _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
            >
              Back to Resources
            </Button>
          </HStack>
        </Flex>
      </Box>

      {loading ? (
        <HStack spacing={3} py={12} justify="center">
          <Spinner size="md" color="#56756D" thickness="3px" />
          <Text fontSize="13px" color="#5A6E65">Loading assessment catalog...</Text>
        </HStack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {assessments.map((item) => (
            <Box
              key={item.id}
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.14)"
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 24px -2px rgba(38, 58, 51, 0.08)" }}
              transition="all 0.2s ease"
            >
              <VStack align="stretch" spacing={4} justify="space-between" h="100%">
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" align="start">
                    <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiClipboard} boxSize="18px" />
                    </Circle>
                    <Badge 
                      bg="rgba(86, 117, 109, 0.1)" 
                      color="#263A33" 
                      borderRadius="full" 
                      px={2.5} 
                      py={0.5} 
                      fontSize="10.5px" 
                      fontWeight="700" 
                      letterSpacing="0.05em"
                    >
                      {item.abbreviation}
                    </Badge>
                  </HStack>

                  <VStack align="start" spacing={1}>
                    <Heading 
                      as="h3" 
                      fontSize="15px" 
                      fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                      fontWeight="600" 
                      color="#263A33"
                    >
                      {item.name}
                    </Heading>
                    <Text fontSize="12px" color="#718096">
                      {item.completionTime} • Age {item.ageRange}
                    </Text>
                  </VStack>
                </VStack>

                <Button
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  h="36px"
                  fontSize="12.5px"
                  fontWeight="600"
                  w="100%"
                  _hover={{ bg: "#263A33" }}
                  onClick={() => router.push(`/dashboard/therapist/resources/assessments/${item.id}`)}
                >
                  Open assessment details
                </Button>
              </VStack>
            </Box>
          ))}
          {assessments.length === 0 ? (
            <VStack spacing={2} py={12} gridColumn={{ base: "1", md: "span 2", lg: "span 3" }} textAlign="center">
              <Text fontSize="14px" color="#5A6E65">No assessments available.</Text>
            </VStack>
          ) : null}
        </SimpleGrid>
      )}
    </Box>
  );
}
