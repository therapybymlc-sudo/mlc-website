import { useEffect, useMemo, useState } from "react";
import { 
  Button, HStack, Text, VStack, Box, Heading,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  useDisclosure, Icon, Circle, Badge 
} from "@chakra-ui/react";
import { resourcesApi } from "../../api/resources";
import SchedulePageHeader from "../scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../scheduling/ScheduleStatusBadge";
import ScheduleEmptyState from "../scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../scheduling/ScheduleErrorState";
import ScheduleActionBar from "../scheduling/ScheduleActionBar";
import { getSchedulingErrorMessage } from "../../utils/schedulingErrors";
import { 
  FiArrowRight, 
  FiCheckCircle, 
  FiFileText, 
  FiClock, 
  FiFolder, 
  FiClipboard, 
  FiExternalLink,
  FiBookOpen
} from "react-icons/fi";
import AssessmentForm from "../assessments/AssessmentForm";

export default function ClientResources() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forms, setForms] = useState([]);
  const [submittingFormId, setSubmittingFormId] = useState(null);
  const [responsesByForm, setResponsesByForm] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedForm, setSelectedForm] = useState(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const [data, formData] = await Promise.all([
        resourcesApi.listClientAssignments(),
        resourcesApi.listFormAssignments().catch(() => []),
      ]);
      setAssignments(Array.isArray(data) ? data : []);
      setForms(Array.isArray(formData) ? formData : formData.results || []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load resources."));
    } finally {
      setLoading(false);
    }
  };

  const assessmentForms = useMemo(
    () => forms.filter((f) => f.form_type === "assessment" && f.status !== "reviewed"),
    [forms]
  );

  const submitAssessment = async (formId, responses) => {
    try {
      setSubmittingFormId(formId);
      await resourcesApi.submitAssessmentResponse(formId, { responses });
      onClose();
      await loadAssignments();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to submit assessment."));
    } finally {
      setSubmittingFormId(null);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleMarkViewed = async (assignmentId) => {
    try {
      await resourcesApi.markAssignmentViewed(assignmentId);
      await loadAssignments();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to update resource."));
    }
  };

  const handleMarkCompleted = async (assignmentId) => {
    try {
      await resourcesApi.markAssignmentCompleted(assignmentId);
      await loadAssignments();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to update resource."));
    }
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading resources…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadAssignments} />;
  }

  return (
    <Box maxW="1240px" mx="auto" pb={12} fontFamily="'Inter', var(--font-inter), sans-serif">
      <VStack align="stretch" spacing={6} w="100%">
        {/* 🌿 Page Header */}
        <SchedulePageHeader
          title="Shared Resources"
          subtitle="Care materials, clinical worksheets, and assessments shared by your therapist."
        />

        {/* 📁 Therapist Shared Materials Card */}
        <ScheduleSectionCard 
          title="Therapeutic Materials" 
          subtitle="Open, read, and track guides and worksheets assigned to your healing journey."
        >
          {assignments.length === 0 ? (
            <ScheduleEmptyState
              icon={FiFolder}
              title="No shared resources"
              description="Your therapist will share tailored worksheets, reading materials, or exercises here as your sessions progress."
            />
          ) : (
            <VStack spacing={4} align="stretch">
              {assignments.map((assignment) => (
                <Box
                  key={assignment.id}
                  bg="white"
                  p={{ base: 4, md: 5 }}
                  borderRadius="xl"
                  border="1px solid rgba(86, 117, 109, 0.12)"
                  boxShadow="0 2px 8px rgba(38, 58, 51, 0.03)"
                  transition="all 0.2s"
                  _hover={{ borderColor: "rgba(86, 117, 109, 0.25)", boxShadow: "0 4px 14px -2px rgba(38, 58, 51, 0.06)" }}
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                      <HStack align="flex-start" spacing={3} flex={1} minW="220px">
                        <Circle size="40px" bg="rgba(86, 117, 109, 0.08)" flexShrink={0} mt={0.5}>
                          <Icon as={FiBookOpen} color="#56756D" boxSize="18px" />
                        </Circle>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text 
                            fontWeight="600" 
                            fontSize="15px" 
                            color="#263A33" 
                            fontFamily="'Outfit', var(--font-outfit), sans-serif"
                          >
                            {assignment.resource_title}
                          </Text>
                          {assignment.resource_type_label ? (
                            <Badge
                              bg="rgba(86, 117, 109, 0.08)"
                              color="#56756D"
                              fontSize="10px"
                              fontWeight="700"
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              textTransform="uppercase"
                              letterSpacing="0.06em"
                            >
                              {assignment.resource_type_label}
                            </Badge>
                          ) : null}
                        </VStack>
                      </HStack>
                      <ScheduleStatusBadge status={assignment.status} label={assignment.status_label} />
                    </HStack>

                    {assignment.therapist_note ? (
                      <Box 
                        bg="rgba(86, 117, 109, 0.04)" 
                        p={3} 
                        borderRadius="lg" 
                        borderLeft="3px solid #56756D"
                      >
                        <Text fontSize="12.5px" color="#4A5568" lineHeight="1.5">
                          <Text as="span" fontWeight="600" color="#263A33">Therapist note: </Text>
                          {assignment.therapist_note}
                        </Text>
                      </Box>
                    ) : null}

                    {assignment.resource_text_content ? (
                      <Text fontSize="13px" color="#5A6E65" lineHeight="1.6">
                        {assignment.resource_text_content}
                      </Text>
                    ) : null}

                    <HStack justify="space-between" align="center" pt={1} flexWrap="wrap" gap={3}>
                      {(assignment.resource_url || assignment.resource_file) ? (
                        <Button
                          as="a"
                          href={assignment.resource_url || assignment.resource_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          borderRadius="full"
                          bg="#56756D"
                          color="white"
                          fontSize="12.5px"
                          fontWeight="600"
                          px={4}
                          height="32px"
                          leftIcon={<Icon as={FiExternalLink} boxSize="13px" />}
                          _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                          transition="all 0.2s"
                        >
                          Open Resource
                        </Button>
                      ) : <Box />}

                      <ScheduleActionBar>
                        {assignment.status !== "viewed" && assignment.status !== "completed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            borderRadius="full"
                            borderColor="rgba(86, 117, 109, 0.3)"
                            color="#263A33"
                            fontSize="12.5px"
                            fontWeight="500"
                            height="32px"
                            px={3.5}
                            onClick={() => handleMarkViewed(assignment.id)}
                            _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                          >
                            Mark Viewed
                          </Button>
                        ) : null}
                        {assignment.status !== "completed" ? (
                          <Button
                            size="sm"
                            borderRadius="full"
                            bg="rgba(16, 185, 129, 0.1)"
                            color="#065F46"
                            border="1px solid rgba(16, 185, 129, 0.25)"
                            fontSize="12.5px"
                            fontWeight="600"
                            height="32px"
                            px={3.5}
                            onClick={() => handleMarkCompleted(assignment.id)}
                            _hover={{ bg: "rgba(16, 185, 129, 0.18)" }}
                          >
                            Mark Completed
                          </Button>
                        ) : null}
                      </ScheduleActionBar>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </ScheduleSectionCard>

        {/* 📋 Clinical Assessments Card */}
        <ScheduleSectionCard
          title="Clinical Assessments"
          subtitle="Complete therapist-assigned clinical forms (PHQ-9, GAD-7). Responses are auto-scored and securely shared with your therapist."
        >
          {assessmentForms.length === 0 ? (
            <ScheduleEmptyState
              icon={FiClipboard}
              title="No assessments assigned"
              description="Standardized questionnaires and periodic progress check-ins assigned by your therapist will appear here."
            />
          ) : (
            <VStack spacing={4} align="stretch">
              {assessmentForms.map((form) => {
                const isSubmitted = form.status === "submitted" || form.status === "reviewed";
                const scoring = form.response_data?.scoring || null;
                const estTime = form.form_schema?.estimatedTime || "2-5 mins";

                return (
                  <Box 
                    key={form.id} 
                    bg="white" 
                    borderRadius="xl" 
                    p={{ base: 4, md: 5 }} 
                    border="1px solid" 
                    borderColor={isSubmitted ? "rgba(16, 185, 129, 0.2)" : "rgba(86, 117, 109, 0.12)"}
                    boxShadow="0 2px 8px rgba(38, 58, 51, 0.03)"
                    transition="all 0.2s"
                    _hover={{ borderColor: "rgba(86, 117, 109, 0.25)", boxShadow: "0 4px 14px -2px rgba(38, 58, 51, 0.06)" }}
                  >
                    <HStack align="start" justify="space-between" spacing={4} flexWrap="wrap">
                      <HStack align="start" spacing={3.5} flex={1} minW="220px">
                        <Circle 
                          size="42px" 
                          bg={isSubmitted ? "rgba(16, 185, 129, 0.1)" : "rgba(86, 117, 109, 0.08)"}
                          flexShrink={0}
                          mt={0.5}
                        >
                          <Icon 
                            as={isSubmitted ? FiCheckCircle : FiClipboard} 
                            color={isSubmitted ? "#065F46" : "#56756D"} 
                            boxSize="18px" 
                          />
                        </Circle>
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2} flexWrap="wrap">
                            <Text 
                              fontWeight="600" 
                              color="#263A33" 
                              fontSize="15px"
                              fontFamily="'Outfit', var(--font-outfit), sans-serif"
                            >
                              {form.title}
                            </Text>
                            <ScheduleStatusBadge status={form.status} label={form.status_label} />
                          </HStack>
                          <Text fontSize="13px" color="#5A6E65" noOfLines={2} lineHeight="1.5">
                            {form.instructions || "Clinical monitoring questionnaire assigned by your therapist."}
                          </Text>
                          {!isSubmitted && (
                            <HStack spacing={4} pt={1}>
                              <HStack spacing={1.5} color="#5A6E65">
                                <Icon as={FiClock} boxSize="12px" color="#56756D" />
                                <Text fontSize="11px" fontWeight="600">{estTime}</Text>
                              </HStack>
                              <HStack spacing={1.5} color="#5A6E65">
                                <Icon as={FiFileText} boxSize="12px" color="#56756D" />
                                <Text fontSize="11px" fontWeight="600">{form.form_schema?.items?.length || 0} Questions</Text>
                              </HStack>
                            </HStack>
                          )}
                        </VStack>
                      </HStack>
                      
                      {isSubmitted ? (
                        <VStack align={{ base: "start", sm: "end" }} spacing={1.5}>
                          {typeof scoring?.totalScore === "number" && (
                            <Badge 
                              bg="rgba(16, 185, 129, 0.08)" 
                              color="#065F46"
                              border="1px solid rgba(16, 185, 129, 0.25)"
                              borderRadius="full" 
                              px={3} 
                              py={0.5} 
                              fontSize="11px"
                              fontWeight="600"
                            >
                              Score: {scoring.totalScore} {scoring.severityLabel ? `(${scoring.severityLabel})` : ""}
                            </Badge>
                          )}
                          <Text fontSize="11px" color="#5A6E65" suppressHydrationWarning>
                            Completed {new Date(form.submitted_at).toLocaleDateString()}
                          </Text>
                        </VStack>
                      ) : (
                        <Button
                          bg="#56756D"
                          color="white"
                          size="sm"
                          borderRadius="full"
                          height="34px"
                          px={5}
                          fontSize="13px"
                          fontWeight="600"
                          rightIcon={<FiArrowRight />}
                          onClick={() => {
                            setSelectedForm(form);
                            onOpen();
                          }}
                          _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                          transition="all 0.2s"
                        >
                          Start Assessment
                        </Button>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </ScheduleSectionCard>

        {/* 🔹 Assessment Submission Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" preserveScrollBarGap>
          <ModalOverlay backdropFilter="blur(10px)" bg="rgba(38, 58, 51, 0.4)" />
          <ModalContent borderRadius="2xl" overflow="hidden" m={4} border="1px solid rgba(86, 117, 109, 0.15)">
            <ModalHeader bg="white" borderBottom="1px solid rgba(86, 117, 109, 0.12)" py={5} px={7}>
              <VStack align="start" spacing={1}>
                <Text fontSize="11px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                  Clinical Workspace
                </Text>
                <Heading 
                  fontSize="18px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  {selectedForm?.title}
                </Heading>
              </VStack>
            </ModalHeader>
            <ModalCloseButton mt={3} mr={3} borderRadius="full" />
            <ModalBody p={{ base: 5, md: 7 }} bg="white">
              {selectedForm && (
                <AssessmentForm 
                  form={selectedForm} 
                  isLoading={submittingFormId === selectedForm.id}
                  onSubmit={(responses) => submitAssessment(selectedForm.id, responses)} 
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}
