'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Box, Button, Heading, HStack, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { resourcesApi } from "../../../../../../../api/resources";

const SectionBlock = ({ title, children }) => (
  <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" p={6}>
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
        <HStack>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            {assessment.name}
          </Heading>
          <Badge colorScheme="purple" variant="subtle">{assessment.abbreviation}</Badge>
        </HStack>
        <Text color="gray.500">{assessment.completionTime} • Age {assessment.ageRange}</Text>
        <Button
          colorScheme="purple"
          borderRadius="full"
          onClick={() => router.push(`/dashboard/therapist/clients?assessmentId=${assessment.id}&section=forms`)}
        >
          Assign from Client File
        </Button>
      </VStack>

      <SectionBlock title="Overview">
        <Text fontSize="sm" color="gray.700" mb={2}>{content?.overview?.therapistFacing || "No overview available."}</Text>
        <Text fontSize="sm" color="gray.600">{content?.overview?.clientFriendly || ""}</Text>
      </SectionBlock>

      <SectionBlock title="MLC Use Context">
        <Text fontSize="sm" color="gray.700">{content?.mlcUseContext || "No use-context text available."}</Text>
      </SectionBlock>

      <SectionBlock title="Administration Instructions">
        <Text fontSize="sm" color="gray.700">{content?.administrationInstructions || "No administration instructions available."}</Text>
      </SectionBlock>

      <SectionBlock title="Scoring & Interpretation">
        <Text fontSize="sm" color="gray.700" mb={3}>{content?.scoringInterpretation || "No scoring interpretation text available."}</Text>
        <Table size="sm" variant="simple">
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
      </SectionBlock>

      <SectionBlock title="Limitations & Ethics">
        <Text fontSize="sm" color="gray.700">{content?.limitationsEthics || "No limitations text available."}</Text>
      </SectionBlock>

      <SectionBlock title="Platform Disclaimer">
        <Text fontSize="sm" color="gray.700">{content?.disclaimer || assessment.disclaimer}</Text>
      </SectionBlock>

      <SectionBlock title="Attribution">
        <Text fontSize="sm" color="gray.700">{content?.attribution || assessment.attribution}</Text>
      </SectionBlock>
    </VStack>
  );
}
