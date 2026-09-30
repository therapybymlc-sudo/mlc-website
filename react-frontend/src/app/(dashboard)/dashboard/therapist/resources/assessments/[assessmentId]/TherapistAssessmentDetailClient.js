'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Box, Button, Heading, HStack, Spinner, Table, Tbody, Td, Text, Th, 
  Thead, Tr, VStack, Wrap, Circle, Flex, Badge, Icon 
} from "@chakra-ui/react";
import { FiArrowLeft, FiClipboard, FiClock, FiUsers, FiSend } from "react-icons/fi";
import { resourcesApi } from "../../../../../../../api/resources";

const SectionBlock = ({ id, title, children }) => (
  <Box 
    id={id} 
    bg="white" 
    border="1px solid" 
    borderColor="rgba(86, 117, 109, 0.14)" 
    borderRadius="2xl" 
    p={{ base: 4, md: 5 }} 
    boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
    scrollMarginTop="96px"
  >
    <Heading 
      as="h2" 
      fontSize="15px" 
      fontFamily="'Outfit', var(--font-outfit), sans-serif" 
      fontWeight="600" 
      color="#263A33" 
      letterSpacing="-0.01em"
      mb={3}
    >
      {title}
    </Heading>
    {children}
  </Box>
);

export default function TherapistAssessmentDetailClient() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = String(params?.assessmentId || "").toLowerCase();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallbackCatalog, setIsFallbackCatalog] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const payload = await resourcesApi.listAssessmentCatalog();
        if (!cancelled) setIsFallbackCatalog(payload?.formatVersion === "fallback-v1");
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

  const assessment = useMemo(
    () => assessments.find((item) => String(item.id).toLowerCase() === assessmentId),
    [assessments, assessmentId]
  );

  if (loading) {
    return (
      <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" py={12}>
        <HStack justify="center" spacing={3}>
          <Spinner size="md" color="#56756D" thickness="3px" />
          <Text fontSize="13.5px" color="#5A6E65">Loading clinical assessment details...</Text>
        </HStack>
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" py={8}>
        <VStack align="start" spacing={4} bg="white" p={6} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)">
          <Button 
            size="sm" 
            variant="outline" 
            borderColor="rgba(86, 117, 109, 0.25)"
            color="#263A33"
            borderRadius="full"
            leftIcon={<FiArrowLeft />} 
            onClick={() => router.push("/dashboard/therapist/resources/assessments")}
          >
            Back to Directory
          </Button>
          <Text fontSize="14px" color="#5A6E65">Clinical assessment not found in library catalog.</Text>
        </VStack>
      </Box>
    );
  }

  const content = assessment.content || {};

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
                  {assessment.abbreviation}
                </Badge>
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                fontWeight="600"
                color="#263A33"
                letterSpacing="-0.015em"
                lineHeight="1.25"
              >
                {assessment.name}
              </Heading>

              <HStack spacing={3} color="#5A6E65" fontSize="12.5px" pt={0.5} wrap="wrap">
                <HStack spacing={1.5}>
                  <Icon as={FiClock} boxSize="13px" />
                  <Text>{assessment.completionTime}</Text>
                </HStack>
                <Text color="rgba(86, 117, 109, 0.3)">•</Text>
                <HStack spacing={1.5}>
                  <Icon as={FiUsers} boxSize="13px" />
                  <Text>Target Age: {assessment.ageRange}</Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>

          {/* Right: Actions */}
          <HStack spacing={3} wrap="wrap">
            <Button
              variant="outline"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              borderRadius="full"
              height="38px"
              fontSize="12.5px"
              fontWeight="600"
              px={4}
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push("/dashboard/therapist/resources/assessments")}
              _hover={{ bg: "rgba(86, 117, 109, 0.05)" }}
            >
              Back to Catalog
            </Button>

            <Button
              bg="#56756D"
              _hover={{ bg: "#263A33" }}
              color="white"
              borderRadius="full"
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              leftIcon={<FiSend />}
              isDisabled={isFallbackCatalog}
              onClick={() => router.push(`/dashboard/therapist/clients?assessmentId=${assessment.id}&section=forms`)}
            >
              Assign from Client File
            </Button>
          </HStack>
        </Flex>

        {isFallbackCatalog && (
          <Box mt={3} p={2.5} px={3.5} borderRadius="xl" bg="#FFFBEB" border="1px solid rgba(245, 158, 11, 0.3)">
            <Text fontSize="12px" color="#92400E" fontWeight="500">
              Assignment is temporarily unavailable until the assessments API is deployed.
            </Text>
          </Box>
        )}
      </Box>

      {/* 🧭 2. QUICK NAVIGATION ANCHOR BAR */}
      <Wrap spacing={2} mb={6}>
        {[
          { label: "Overview", href: "#overview" },
          { label: "MLC Use Context", href: "#mlc-use-context" },
          { label: "Administration", href: "#administration-instructions" },
          { label: "Scoring & Interpretation", href: "#scoring-interpretation" },
          { label: "Limitations & Ethics", href: "#limitations-ethics" },
          { label: "Psychometric", href: "#psychometric-properties" },
          { label: "Disclaimer", href: "#platform-disclaimer" },
          { label: "Attribution", href: "#attribution" },
          { label: "References", href: "#references" },
        ].map((item) => (
          <Button
            key={item.href}
            as="a"
            href={item.href}
            size="xs"
            variant="outline"
            borderColor="rgba(86, 117, 109, 0.16)"
            bg="rgba(250, 248, 245, 0.9)"
            color="#263A33"
            borderRadius="full"
            px={3}
            py="5px"
            fontSize="12px"
            fontWeight="500"
            _hover={{
              bg: "rgba(86, 117, 109, 0.1)",
              borderColor: "rgba(86, 117, 109, 0.3)",
              color: "#263A33",
            }}
            transition="all 0.15s ease"
          >
            {item.label}
          </Button>
        ))}
      </Wrap>

      {/* 📄 3. CONTENT SECTIONS */}
      <VStack align="stretch" spacing={5}>
        <SectionBlock id="overview" title="Overview">
          <Text fontSize="13.5px" color="#5A6E65" mb={4} whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.overviewGeneral || "No overview available."}
          </Text>
          <Text fontSize="13px" color="#263A33" mb={1.5} fontWeight="600">
            Therapist-facing explanation
          </Text>
          <Text fontSize="13.5px" color="#5A6E65" mb={4} whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.overview?.therapistFacing || "No therapist-facing overview available."}
          </Text>
          <Text fontSize="13px" color="#263A33" mb={1.5} fontWeight="600">
            Client-friendly explanation
          </Text>
          <Text fontSize="13.5px" color="#5A6E65" whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.overview?.clientFriendly || "No client-facing overview available."}
          </Text>
        </SectionBlock>

        <SectionBlock id="mlc-use-context" title="MLC Use Context">
          <Text fontSize="13.5px" color="#5A6E65" whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.mlcUseContext || "No use-context text available."}
          </Text>
        </SectionBlock>

        <SectionBlock id="administration-instructions" title="Administration Instructions">
          <Text fontSize="13.5px" color="#5A6E65" whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.administrationInstructions || "No administration instructions available."}
          </Text>
        </SectionBlock>

        <SectionBlock id="scoring-interpretation" title="Scoring & Interpretation">
          <Text fontSize="13.5px" color="#5A6E65" mb={4} whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.scoringInterpretation || "No scoring interpretation text available."}
          </Text>
          {assessment.severityBands && assessment.severityBands.length > 0 && (
            <Box 
              overflowX="auto" 
              w="100%" 
              borderRadius="xl" 
              border="1px solid rgba(86, 117, 109, 0.12)"
              bg="rgba(250, 248, 245, 0.5)"
            >
              <Table size="sm" variant="simple" minW="400px">
                <Thead bg="rgba(86, 117, 109, 0.06)">
                  <Tr>
                    <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>Range</Th>
                    <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>Severity</Th>
                    <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>Level</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {assessment.severityBands.map((band) => (
                    <Tr key={`${band.min}-${band.max}`} _hover={{ bg: "rgba(86, 117, 109, 0.03)" }}>
                      <Td fontSize="13px" fontWeight="600" color="#263A33">{band.min} – {band.max}</Td>
                      <Td fontSize="13px" color="#5A6E65">{band.label}</Td>
                      <Td fontSize="13px" color="#56756D" fontWeight="600">{band.severityNumericLevel}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </SectionBlock>

        <SectionBlock id="limitations-ethics" title="Limitations & Ethics">
          <Text fontSize="13.5px" color="#5A6E65" whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.limitationsEthics || "No limitations text available."}
          </Text>
        </SectionBlock>

        <SectionBlock id="psychometric-properties" title="Psychometric Properties">
          <Text fontSize="13.5px" color="#5A6E65" whiteSpace="pre-wrap" lineHeight="1.6">
            {content?.psychometricProperties || "No psychometric text available."}
          </Text>
        </SectionBlock>

        <SectionBlock id="platform-disclaimer" title="Platform Disclaimer">
          <Text fontSize="13px" color="#5A6E65" lineHeight="1.6">
            {content?.disclaimer || assessment.disclaimer || "Clinical assessments are clinical decision support aids and should not be used in isolation for diagnosing mental health disorders."}
          </Text>
        </SectionBlock>

        <SectionBlock id="attribution" title="Attribution">
          <Text fontSize="13px" color="#5A6E65" lineHeight="1.6">
            {content?.attribution || assessment.attribution || "Clinical research and validated psychometric scales."}
          </Text>
        </SectionBlock>

        <SectionBlock id="references" title="References">
          {(content?.references || []).length === 0 ? (
            <Text fontSize="13px" color="#718096">No specific references listed.</Text>
          ) : (
            <VStack align="start" spacing={2.5}>
              {(content.references || []).map((reference) => (
                <Text key={reference} fontSize="13px" color="#5A6E65" whiteSpace="pre-wrap" lineHeight="1.5">
                  • {reference}
                </Text>
              ))}
            </VStack>
          )}
        </SectionBlock>
      </VStack>
    </Box>
  );
}
