import { useEffect, useState } from "react";
import { Text, VStack } from "@chakra-ui/react";
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
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load booking requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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
      <ScheduleSectionCard title="Requests" subtitle="Pending, confirmed, or declined">
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
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
