import { useEffect, useMemo, useState } from "react";
import { 
  Button, HStack, Text, VStack, Box, RadioGroup, Radio,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  useDisclosure, Icon, Circle, Divider, Badge 
} from "@chakra-ui/react";
import { resourcesApi } from "../../../api/resources";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import ScheduleActionBar from "../../../components/scheduling/ScheduleActionBar";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";
import { FiArrowRight, FiCheckCircle, FiFileText, FiClock } from "react-icons/fi";
import AssessmentForm from "../../../components/assessments/AssessmentForm";

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

  const updateResponse = (formId, itemIndex, value) => {
    setResponsesByForm((prev) => {
      const current = prev[formId] || {};
      return {
        ...prev,
        [formId]: {
          ...current,
          [itemIndex]: Number(value),
        },
      };
    });
  };

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
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Shared resources"
        subtitle="Resources your therapist has shared with you."
      />
      <ScheduleSectionCard title="Resources" subtitle="Open and track shared materials.">
        {assignments.length === 0 ? (
          <ScheduleEmptyState
            title="No shared resources"
            description="Your therapist can assign resources here once available."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {assignments.map((assignment) => (
              <VStack key={assignment.id} align="stretch" spacing={3}>
                <HStack justify="space-between" align="flex-start" flexWrap="wrap">
                  <VStack align="start" spacing={1} flex={1} minW="200px">
                    <Text fontWeight="semibold">{assignment.resource_title}</Text>
                    {assignment.therapist_note ? (
                      <Text fontSize="sm" color="gray.600">
                        Note: {assignment.therapist_note}
                      </Text>
                    ) : null}
                    {assignment.resource_type_label ? (
                      <Text fontSize="xs" color="gray.500">
                        {assignment.resource_type_label}
                      </Text>
                    ) : null}
                  </VStack>
                  <ScheduleStatusBadge status={assignment.status} label={assignment.status_label} />
                </HStack>
                {assignment.resource_text_content ? (
                  <Text fontSize="sm" color="gray.600">
                    {assignment.resource_text_content}
                  </Text>
                ) : null}
                {(assignment.resource_url || assignment.resource_file) && (
                  <Button
                    as="a"
                    href={assignment.resource_url || assignment.resource_file}
                    target="_blank"
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                  >
                    Open resource
                  </Button>
                )}
                <ScheduleActionBar>
                  {assignment.status !== "viewed" && assignment.status !== "completed" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      onClick={() => handleMarkViewed(assignment.id)}
                    >
                      Mark viewed
                    </Button>
                  ) : null}
                  {assignment.status !== "completed" ? (
                    <Button
                      size="sm"
                      colorScheme="teal"
                      borderRadius="full"
                      onClick={() => handleMarkCompleted(assignment.id)}
                    >
                      Mark completed
                    </Button>
                  ) : null}
                </ScheduleActionBar>
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>
      <ScheduleSectionCard
        title="Clinical assessments"
        subtitle="Complete therapist-assigned forms. Reports are auto-scored and shared with your therapist."
      >
        {assessmentForms.length === 0 ? (
          <ScheduleEmptyState
            title="No assessments assigned"
            description="Your therapist can assign assessments here."
          />
        ) : (
          <VStack spacing={6} align="stretch">
            {assessmentForms.map((form) => {
              const isSubmitted = form.status === "submitted" || form.status === "reviewed";
              const scoring = form.response_data?.scoring || null;
              const estTime = form.form_schema?.estimatedTime || "2-5 mins";

              return (
                <Box 
                  key={form.id} 
                  bg="white" 
                  borderRadius="2xl" 
                  p={6} 
                  border="1px solid" 
                  borderColor={isSubmitted ? "teal.100" : "gray.100"}
                  shadow="sm"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                >
                  <HStack align="start" justify="space-between" spacing={4} flexWrap="wrap">
                    <HStack align="start" spacing={4} flex={1}>
                      <Circle size="50px" bg={isSubmitted ? "teal.50" : "orange.50"}>
                        <Icon as={isSubmitted ? FiCheckCircle : FiFileText} color={isSubmitted ? "teal.500" : "orange.500"} boxSize={6} />
                      </Circle>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="800" color="#2E2E2E" fontSize="lg">{form.title}</Text>
                          <ScheduleStatusBadge status={form.status} label={form.status_label} />
                        </HStack>
                        <Text fontSize="sm" color="gray.500" noOfLines={1}>{form.instructions || "Assign clinical monitoring form."}</Text>
                        {!isSubmitted && (
                           <HStack spacing={4} pt={1}>
                              <HStack spacing={1} color="gray.400">
                                <Icon as={FiClock} boxSize={3} />
                                <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase">{estTime}</Text>
                              </HStack>
                              <HStack spacing={1} color="gray.400">
                                <Icon as={FiFileText} boxSize={3} />
                                <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase">{form.form_schema?.items?.length || 0} Items</Text>
                              </HStack>
                           </HStack>
                        )}
                      </VStack>
                    </HStack>
                    
                    {isSubmitted ? (
                       <VStack align="end" spacing={2}>
                          {typeof scoring?.totalScore === "number" && (
                             <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="xs">
                               Score: {scoring.totalScore} {scoring.severityLabel ? `(${scoring.severityLabel})` : ""}
                             </Badge>
                          )}
                          <Text fontSize="xs" color="gray.400" suppressHydrationWarning>
                             Submitted {new Date(form.submitted_at).toLocaleDateString()}
                          </Text>
                       </VStack>
                    ) : (
                      <Button
                        bg="#56756D"
                        color="white"
                        size="md"
                        borderRadius="full"
                        px={8}
                        rightIcon={<FiArrowRight />}
                        onClick={() => {
                          setSelectedForm(form);
                          onOpen();
                        }}
                        _hover={{ bg: '#455c56', shadow: 'lg' }}
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
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" overflow="hidden" m={4}>
          <ModalHeader bg="white" borderBottom="1px solid" borderColor="gray.50" py={6} px={8}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="bold" color="teal.600" letterSpacing="0.2em" textTransform="uppercase">Assessment Workspace</Text>
              <Heading size="md" color="#2E2E2E" fontFamily="'Playfair Display', serif">{selectedForm?.title}</Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton mt={4} mr={4} borderRadius="full" />
          <ModalBody p={8} bg="white">
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
  );
}
