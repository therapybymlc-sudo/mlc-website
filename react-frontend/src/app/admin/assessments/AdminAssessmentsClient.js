'use client';

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Heading, HStack, Select, Spinner, Text, VStack, RadioGroup, Radio, Alert, AlertIcon } from "@chakra-ui/react";
import { resourcesApi } from "../../../api/resources";

export default function AdminAssessmentsClient() {
  const [catalog, setCatalog] = useState([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadCatalog = async () => {
      try {
        const payload = await resourcesApi.listAssessmentCatalog();
        const assessments = payload?.assessments || [];
        if (!cancelled) {
          setCatalog(assessments);
          setAssessmentId(assessments[0]?.id || "");
        }
      } catch (_err) {
        if (!cancelled) setError("Could not load assessment catalog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => catalog.find((item) => item.id === assessmentId) || null,
    [catalog, assessmentId]
  );

  const setResponse = (itemIndex, value) => {
    setResponses((prev) => ({ ...prev, [itemIndex]: Number(value) }));
  };

  const runTest = async () => {
    if (!selected) return;
    const built = (selected.items || []).map((item) => ({
      itemIndex: item.itemIndex,
      value: responses[item.itemIndex],
    }));
    if (built.some((row) => row.value === undefined || row.value === null)) {
      setError("Complete all items before running test administration.");
      return;
    }
    setError("");
    try {
      setSubmitting(true);
      const payload = await resourcesApi.adminTestAdministerAssessment({
        assessment_id: selected.id,
        responses: built,
      });
      setResult(payload);
    } catch (_err) {
      setError("Unable to test administer this assessment.");
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box p={8}>
        <HStack><Spinner size="sm" color="teal.500" /><Text>Loading assessment QA panel...</Text></HStack>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg">Assessment test administration</Heading>
          <Text color="gray.600" mt={2}>
            Admin can run scoring tests before therapist assignment rollout.
          </Text>
        </Box>

        {error ? (
          <Alert status="error" borderRadius="lg"><AlertIcon />{error}</Alert>
        ) : null}

        <Select value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)} maxW="420px" bg="white">
          {catalog.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>{assessment.name}</option>
          ))}
        </Select>

        {selected ? (
          <VStack align="stretch" spacing={4}>
            {(selected.items || []).map((item) => (
              <Box key={item.itemIndex} bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
                <Text fontWeight="600" mb={2}>{item.itemNumber}. {item.itemText}</Text>
                <RadioGroup
                  value={responses[item.itemIndex] !== undefined ? String(responses[item.itemIndex]) : ""}
                  onChange={(value) => setResponse(item.itemIndex, value)}
                >
                  <HStack spacing={4} wrap="wrap">
                    {(selected.responseScale || []).map((scale) => (
                      <Radio key={`${item.itemIndex}-${scale.value}`} value={String(scale.value)}>
                        {scale.label}
                      </Radio>
                    ))}
                  </HStack>
                </RadioGroup>
              </Box>
            ))}
            <Button colorScheme="teal" borderRadius="full" onClick={runTest} isLoading={submitting} alignSelf="flex-start">
              Run test administration
            </Button>
          </VStack>
        ) : null}

        {result ? (
          <Box bg="teal.50" border="1px solid" borderColor="teal.100" borderRadius="lg" p={4}>
            <Text fontWeight="700">Result</Text>
            <Text>Total score: {result?.scoring?.totalScore}</Text>
            <Text>Severity: {result?.scoring?.severityLabel}</Text>
            <Text>Immediate review: {result?.scoring?.requiresImmediateReview ? "Yes" : "No"}</Text>
            {(result?.scoring?.riskFlags || []).length > 0 ? (
              <Text color="red.600" fontWeight="700" mt={2}>
                Risk flags: {result.scoring.riskFlags.map((flag) => flag.label).join(", ")}
              </Text>
            ) : null}
          </Box>
        ) : null}
      </VStack>
    </Box>
  );
}
