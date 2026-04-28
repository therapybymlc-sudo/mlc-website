'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Heading, HStack, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, Wrap } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { resourcesApi } from "../../../../../../../api/resources";

const SectionBlock = ({ id, title, children }) => (
  <Box id={id} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6} scrollMarginTop="96px">
    <Heading size="sm" mb={3}>{title}</Heading>
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
    return <HStack><Spinner size="sm" color="teal.500" /><Text>Loading assessment...</Text></HStack>;
  }

  if (!assessment) {
    return (
      <VStack align="start" spacing={4}>
        <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => router.push("/dashboard/therapist/resources/assessments")}>
          Back to directory
        </Button>
        <Text color="gray.600">Assessment not found.</Text>
      </VStack>
    );
  }

  const content = assessment.content || {};

  return (
    <VStack align="stretch" spacing={6}>
      <VStack align="start" spacing={2}>
        <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => router.push("/dashboard/therapist/resources/assessments")}>
          Back to directory
        </Button>
        <HStack wrap="wrap">
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            {assessment.name}
          </Heading>
          <Box px={2} py={1} borderRadius="full" bg="purple.50">
            <Text fontSize="xs" color="purple.700" fontWeight="700">{assessment.abbreviation}</Text>
          </Box>
        </HStack>
        <Text color="gray.500">{assessment.completionTime} • Age {assessment.ageRange}</Text>
        <Button
          colorScheme="purple"
          borderRadius="full"
          isDisabled={isFallbackCatalog}
          onClick={() => router.push(`/dashboard/therapist/clients?assessmentId=${assessment.id}&section=forms`)}
        >
          Assign from Client File
        </Button>
        {isFallbackCatalog ? (
          <Text fontSize="xs" color="orange.600">
            Assignment is temporarily unavailable until the assessments API is deployed.
          </Text>
        ) : null}
      </VStack>

      <Wrap spacing={2}>
        <Button as="a" href="#overview" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Overview</Button>
        <Button as="a" href="#mlc-use-context" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">MLC Use Context</Button>
        <Button as="a" href="#administration-instructions" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Administration</Button>
        <Button as="a" href="#scoring-interpretation" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Scoring</Button>
        <Button as="a" href="#limitations-ethics" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Limitations</Button>
        <Button as="a" href="#psychometric-properties" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Psychometric</Button>
        <Button as="a" href="#platform-disclaimer" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Disclaimer</Button>
        <Button as="a" href="#attribution" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">Attribution</Button>
        <Button as="a" href="#references" size="xs" variant="ghost" colorScheme="purple" borderRadius="full">References</Button>
      </Wrap>

      <SectionBlock id="overview" title="Overview">
        <Text fontSize="sm" color="gray.700" mb={3} whiteSpace="pre-wrap">
          {content?.overviewGeneral || "No overview available."}
        </Text>
        <Text fontSize="sm" color="gray.700" mb={2} fontWeight="700">Therapist-facing explanation</Text>
        <Text fontSize="sm" color="gray.700" mb={3} whiteSpace="pre-wrap">
          {content?.overview?.therapistFacing || "No therapist-facing overview available."}
        </Text>
        <Text fontSize="sm" color="gray.700" mb={2} fontWeight="700">Client-friendly explanation</Text>
        <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
          {content?.overview?.clientFriendly || ""}
        </Text>
      </SectionBlock>

      <SectionBlock id="mlc-use-context" title="MLC Use Context">
        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{content?.mlcUseContext || "No use-context text available."}</Text>
      </SectionBlock>

      <SectionBlock id="administration-instructions" title="Administration Instructions">
        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{content?.administrationInstructions || "No administration instructions available."}</Text>
      </SectionBlock>

      <SectionBlock id="scoring-interpretation" title="Scoring & Interpretation">
        <Text fontSize="sm" color="gray.700" mb={3} whiteSpace="pre-wrap">{content?.scoringInterpretation || "No scoring interpretation text available."}</Text>
        <Box overflowX="auto" w="100%">
          <Table size="sm" variant="simple" minW="400px">
            <Thead>
              <Tr>
                <Th>Range</Th>
                <Th>Severity</Th>
                <Th>Level</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(assessment.severityBands || []).map((band) => (
                <Tr key={`${band.min}-${band.max}`}>
                  <Td>{band.min}-{band.max}</Td>
                  <Td>{band.label}</Td>
                  <Td>{band.severityNumericLevel}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionBlock>

      <SectionBlock id="limitations-ethics" title="Limitations & Ethics">
        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{content?.limitationsEthics || "No limitations text available."}</Text>
      </SectionBlock>

      <SectionBlock id="psychometric-properties" title="Psychometric Properties">
        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{content?.psychometricProperties || "No psychometric text available."}</Text>
      </SectionBlock>

      <SectionBlock id="platform-disclaimer" title="Platform Disclaimer">
        <Text fontSize="sm" color="gray.700">{content?.disclaimer || assessment.disclaimer}</Text>
      </SectionBlock>

      <SectionBlock id="attribution" title="Attribution">
        <Text fontSize="sm" color="gray.700">{content?.attribution || assessment.attribution}</Text>
      </SectionBlock>

      <SectionBlock id="references" title="References">
        {(content?.references || []).length === 0 ? (
          <Text fontSize="sm" color="gray.700">No references provided.</Text>
        ) : (
          <VStack align="start" spacing={2}>
            {(content.references || []).map((reference) => (
              <Text key={reference} fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                - {reference}
              </Text>
            ))}
          </VStack>
        )}
      </SectionBlock>
    </VStack>
  );
}
