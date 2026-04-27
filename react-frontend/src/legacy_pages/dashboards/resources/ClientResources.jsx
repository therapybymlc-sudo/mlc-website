import { useEffect, useMemo, useState } from "react";
import { Button, HStack, Text, VStack, Box, RadioGroup, Radio } from "@chakra-ui/react";
import { resourcesApi } from "../../../api/resources";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import ScheduleActionBar from "../../../components/scheduling/ScheduleActionBar";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";

export default function ClientResources() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forms, setForms] = useState([]);
  const [submittingFormId, setSubmittingFormId] = useState(null);
  const [responsesByForm, setResponsesByForm] = useState({});

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

  const submitAssessment = async (form) => {
    const schema = form.form_schema || {};
    const items = schema.items || [];
    const formResponses = responsesByForm[form.id] || {};
    const responses = items.map((item) => ({
      itemIndex: item.itemIndex,
      value: formResponses[item.itemIndex],
    }));
    const hasIncomplete = responses.some((row) => row.value === undefined || row.value === null);
    if (hasIncomplete) {
      setError("Please complete every assessment item before submitting.");
      return;
    }
    try {
      setSubmittingFormId(form.id);
      await resourcesApi.submitAssessmentResponse(form.id, { responses });
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
        title="Assigned assessments"
        subtitle="Complete therapist-assigned forms. Reports are auto-scored and shared with your therapist."
      >
        {assessmentForms.length === 0 ? (
          <ScheduleEmptyState
            title="No assessments assigned"
            description="Your therapist can assign assessments here."
          />
        ) : (
          <VStack spacing={5} align="stretch">
            {assessmentForms.map((form) => {
              const schema = form.form_schema || {};
              const items = schema.items || [];
              const responseScale = schema.responseScale || [];
              return (
                <Box key={form.id} border="1px solid" borderColor="gray.200" borderRadius="xl" p={4}>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="700">{form.title}</Text>
                      <ScheduleStatusBadge status={form.status} label={form.status_label} />
                    </HStack>
                    <Text fontSize="sm" color="gray.600">{form.instructions}</Text>
                    {items.map((item) => (
                      <Box key={item.itemIndex} w="100%">
                        <Text fontSize="sm" fontWeight="600" mb={2}>
                          {item.itemNumber}. {item.itemText}
                        </Text>
                        <RadioGroup
                          onChange={(value) => updateResponse(form.id, item.itemIndex, value)}
                          value={
                            responsesByForm[form.id]?.[item.itemIndex] !== undefined
                              ? String(responsesByForm[form.id]?.[item.itemIndex])
                              : ""
                          }
                        >
                          <HStack spacing={4} wrap="wrap">
                            {responseScale.map((scale) => (
                              <Radio key={`${form.id}-${item.itemIndex}-${scale.value}`} value={String(scale.value)}>
                                {scale.label}
                              </Radio>
                            ))}
                          </HStack>
                        </RadioGroup>
                      </Box>
                    ))}
                    <Button
                      colorScheme="teal"
                      size="sm"
                      borderRadius="full"
                      onClick={() => submitAssessment(form)}
                      isLoading={submittingFormId === form.id}
                    >
                      Submit assessment
                    </Button>
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
