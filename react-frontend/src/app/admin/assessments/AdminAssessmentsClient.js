'use client';

import { useEffect, useMemo, useState } from "react";
import { 
  Box, 
  Button, 
  Heading, 
  HStack, 
  Stack,
  Spinner, 
  Text, 
  VStack, 
  RadioGroup, 
  Radio, 
  Badge,
  Circle,
  Icon,
  Divider,
  Flex
} from "@chakra-ui/react";
import { 
  FiClipboard, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiPlay, 
  FiCheck,
  FiHelpCircle
} from "react-icons/fi";
import { resourcesApi } from "../../../api/resources";
import ModernSelect from "../../../components/ModernSelect";

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

  const selectOptions = useMemo(
    () => catalog.map(a => ({ value: a.id, label: a.name })),
    [catalog]
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
      setError("Please select an answer for all questions before running the test administration.");
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
      <Flex minH="60vh" align="center" justify="center">
        <VStack spacing={3}>
          <Spinner size="xl" thickness="3px" color="#56756D" />
          <Text fontSize="13px" color="#5A6E65" fontFamily="'Inter', sans-serif">Loading psychometric test panel...</Text>
        </VStack>
      </Flex>
    );
  }

  const answeredCount = Object.keys(responses).length;
  const totalItemsCount = selected?.items?.length || 0;

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 UNIFIED HERO BANNER (Rule 8 & 10) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Identity & Space Title */}
          <HStack spacing={3.5} align="center">
            <Circle size="46px" bg="rgba(128, 90, 213, 0.12)" color="#805AD5" flexShrink={0}>
              <Icon as={FiClipboard} boxSize="22px" />
            </Circle>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(128, 90, 213, 0.12)" 
                  color="#6B46C1" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  Clinical Quality • QA Engine
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
                Assessment QA Administration
              </Heading>
              <Text 
                fontSize="13px" 
                color="#5A6E65" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.4"
              >
                Simulate clinical intake scoring and verify psychometric thresholds before client rollout.
              </Text>
            </VStack>
          </HStack>

          {/* Compact Metric Strip (Rule 10: exactly 3 balanced nodes, no text wrapping) */}
          <Stack direction={{ base: "column", md: "row" }} spacing={3} align={{ base: "stretch", md: "center" }} w={{ base: "full", lg: "auto" }}>
            <HStack 
              spacing={{ base: 1.5, sm: 3 }} 
              p={1.5} 
              px={{ base: 2, sm: 2.5 }} 
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)" 
              border="1px solid rgba(86, 117, 109, 0.1)" 
              w={{ base: "full", md: "auto" }} 
              justify="space-between"
            >
              {/* Node 1: Catalog */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiClipboard} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Active Scales
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {catalog.length}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Node 2: Items in scale */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(99, 102, 241, 0.12)" color="#4F46E5" flexShrink={0}>
                  <Icon as={FiCheck} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Items Selected
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {totalItemsCount}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Node 3: Answered */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiCheckCircle} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Answered
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {answeredCount} / {totalItemsCount}
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* 📋 TEST PANEL CARD */}
      <Box 
        bg="white" 
        p={6} 
        borderRadius="2xl" 
        border="1px solid rgba(86, 117, 109, 0.14)" 
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      >
        <VStack align="stretch" spacing={6}>
          {/* Scale Selection */}
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <VStack align="start" spacing={0.5}>
              <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                Select Assessment Scale
              </Text>
              <Text fontSize="12px" color="#5A6E65">
                Choose an intake scale to preview items and simulate scoring
              </Text>
            </VStack>
            <Box w={{ base: "full", sm: "360px" }}>
              <ModernSelect
                value={assessmentId}
                onChange={(val) => {
                  setAssessmentId(val);
                  setResponses({});
                  setResult(null);
                  setError("");
                }}
                options={selectOptions}
                h="42px"
                borderRadius="xl"
              />
            </Box>
          </HStack>

          {error && (
            <HStack p={3.5} borderRadius="xl" bg="#FEF2F2" border="1px solid rgba(239, 68, 68, 0.3)" spacing={2.5}>
              <Icon as={FiAlertTriangle} color="#DC2626" boxSize="16px" flexShrink={0} />
              <Text fontSize="12.5px" color="#DC2626" fontWeight="500">{error}</Text>
            </HStack>
          )}

          {/* Questionnaire Questions */}
          {selected && (
            <VStack align="stretch" spacing={3}>
              {(selected.items || []).map((item) => {
                const isAnswered = responses[item.itemIndex] !== undefined;
                return (
                  <Box 
                    key={item.itemIndex} 
                    p={4} 
                    borderRadius="xl" 
                    bg={isAnswered ? "white" : "rgba(250, 248, 245, 0.85)"} 
                    border="1px solid" 
                    borderColor={isAnswered ? "#56756D" : "rgba(86, 117, 109, 0.12)"}
                    transition="all 0.15s ease"
                  >
                    <HStack justify="space-between" align="start" mb={2}>
                      <Text fontWeight="600" fontSize="13px" color="#263A33">
                        {item.itemNumber}. {item.itemText}
                      </Text>
                      {isAnswered && (
                        <Circle size="18px" bg="rgba(16, 185, 129, 0.15)" color="#059669">
                          <Icon as={FiCheck} boxSize="11px" />
                        </Circle>
                      )}
                    </HStack>
                    <RadioGroup
                      value={responses[item.itemIndex] !== undefined ? String(responses[item.itemIndex]) : ""}
                      onChange={(value) => setResponse(item.itemIndex, value)}
                    >
                      <HStack spacing={4} wrap="wrap" mt={1}>
                        {(selected.responseScale || []).map((scale) => (
                          <Radio 
                            key={`${item.itemIndex}-${scale.value}`} 
                            value={String(scale.value)}
                            colorScheme="teal"
                            size="sm"
                          >
                            <Text fontSize="12.5px" color="#263A33" fontWeight="500">
                              {scale.label}
                            </Text>
                          </Radio>
                        ))}
                      </HStack>
                    </RadioGroup>
                  </Box>
                );
              })}

              <HStack justify="flex-end" pt={4}>
                <Button 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full"
                  height="38px"
                  fontSize="13px"
                  fontWeight="600"
                  px={6}
                  leftIcon={<Icon as={FiPlay} boxSize="13px" />}
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                  onClick={runTest} 
                  isLoading={submitting}
                >
                  Run Test Administration
                </Button>
              </HStack>
            </VStack>
          )}

          {/* Test Scoring Results */}
          {result && (
            <Box 
              p={5} 
              borderRadius="xl" 
              bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" 
              border="1px solid rgba(16, 185, 129, 0.35)"
              boxShadow="0 8px 24px -4px rgba(6, 78, 59, 0.08)"
            >
              <HStack justify="space-between" mb={3} flexWrap="wrap">
                <HStack spacing={2.5}>
                  <Circle size="28px" bg="rgba(16, 185, 129, 0.2)" color="#047857">
                    <Icon as={FiCheckCircle} boxSize="15px" />
                  </Circle>
                  <Text fontSize="14px" fontWeight="700" color="#064E3B" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                    Simulation Scoring Complete
                  </Text>
                </HStack>
                <Badge 
                  bg="rgba(16, 185, 129, 0.2)" 
                  color="#047857" 
                  fontSize="11px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={3} 
                  py={0.5}
                >
                  Total Score: {result?.scoring?.totalScore}
                </Badge>
              </HStack>

              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mt={2}>
                <Box p={3} bg="white" borderRadius="lg" border="1px solid rgba(16, 185, 129, 0.2)">
                  <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase">SEVERITY CLASSIFICATION</Text>
                  <Text fontSize="14px" fontWeight="700" color="#064E3B" mt={0.5}>
                    {result?.scoring?.severityLabel || "Standard"}
                  </Text>
                </Box>
                <Box p={3} bg="white" borderRadius="lg" border="1px solid rgba(16, 185, 129, 0.2)">
                  <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase">IMMEDIATE CLINICAL REVIEW</Text>
                  <Text fontSize="14px" fontWeight="700" color={result?.scoring?.requiresImmediateReview ? "#DC2626" : "#064E3B"} mt={0.5}>
                    {result?.scoring?.requiresImmediateReview ? "Flagged: Yes" : "No"}
                  </Text>
                </Box>
                <Box p={3} bg="white" borderRadius="lg" border="1px solid rgba(16, 185, 129, 0.2)">
                  <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase">RISK FLAGS DETECTED</Text>
                  <Text fontSize="14px" fontWeight="700" color={(result?.scoring?.riskFlags || []).length > 0 ? "#DC2626" : "#064E3B"} mt={0.5}>
                    {(result?.scoring?.riskFlags || []).length} Flags
                  </Text>
                </Box>
              </SimpleGrid>

              {(result?.scoring?.riskFlags || []).length > 0 && (
                <HStack mt={3} p={2.5} borderRadius="lg" bg="#FEF2F2" border="1px solid rgba(239, 68, 68, 0.25)">
                  <Icon as={FiAlertTriangle} color="#DC2626" boxSize="14px" />
                  <Text fontSize="12px" color="#DC2626" fontWeight="600">
                    Risk indicators: {result.scoring.riskFlags.map((flag) => flag.label).join(", ")}
                  </Text>
                </HStack>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
