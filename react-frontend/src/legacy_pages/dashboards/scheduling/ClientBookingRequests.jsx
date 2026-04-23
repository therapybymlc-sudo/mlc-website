import { useEffect, useState } from "react";
import { Text, VStack, Button } from "@chakra-ui/react";
import { schedulingApi } from "../../../api/scheduling";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleDateTimeCard from "../../../components/scheduling/ScheduleDateTimeCard";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";

export default function ClientBookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listClientBookingRequests();
      const list = Array.isArray(data) ? data : data?.results || [];
      setRequests(list);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load booking requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      await schedulingApi.cancelClientBookingRequest(id, "");
      await loadRequests();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to cancel (only pending requests can be cancelled here)."));
    }
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading booking requests…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadRequests} />;
  }

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Your booking requests"
        subtitle="Track upcoming confirmations and status updates."
      />
      <ScheduleSectionCard
        title="Requests"
        subtitle="Pending, confirmed, declined, cancelled, or expired (if the hold timed out before your therapist responded)."
      >
        {requests.length === 0 ? (
          <ScheduleEmptyState
            title="No booking requests"
            description="When you request a session, it will appear here."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {requests.map((req) => (
              <VStack key={req.id} align="stretch" spacing={2}>
                <ScheduleDateTimeCard
                  title={req.therapist_display_name || `Therapist #${req.therapist}`}
                  start={req.slot_start_time}
                  end={req.slot_end_time}
                  rightSlot={<ScheduleStatusBadge status={req.status} label={req.status_label} />}
                />
                {req.therapist_response_note ? (
                  <Text fontSize="xs" color="gray.500">
                    Note from therapist: {req.therapist_response_note}
                  </Text>
                ) : null}
                {req.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    borderRadius="full"
                    onClick={() => handleCancel(req.id)}
                  >
                    Cancel request
                  </Button>
                )}
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
