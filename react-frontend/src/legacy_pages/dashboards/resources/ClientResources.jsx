import { useEffect, useState } from "react";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";
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

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await resourcesApi.listClientAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load resources."));
    } finally {
      setLoading(false);
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
    </VStack>
  );
}
