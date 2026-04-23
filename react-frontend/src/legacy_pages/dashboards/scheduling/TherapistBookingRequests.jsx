import { useEffect, useState } from "react";
import { Button, Text, Textarea, VStack } from "@chakra-ui/react";
import { schedulingApi } from "../../../api/scheduling";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleDateTimeCard from "../../../components/scheduling/ScheduleDateTimeCard";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import ScheduleActionBar from "../../../components/scheduling/ScheduleActionBar";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";

export default function TherapistBookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listTherapistBookingRequests();
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

  const handleConfirm = async (id) => {
    try {
      await schedulingApi.confirmBookingRequest(id);
      await loadRequests();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to confirm request."));
    }
  };

  const handleDecline = async (id) => {
    try {
      const note = noteDrafts[id] || "";
      await schedulingApi.declineBookingRequest(id, note);
      await loadRequests();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to decline request."));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      await schedulingApi.cancelTherapistBookingRequest(id, noteDrafts[id] || "");
      await loadRequests();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to cancel request."));
    }
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading booking requests…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadRequests} />;
  }

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const otherRequests = requests.filter((req) => req.status !== "pending");

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Booking Requests"
        subtitle="Review and respond to new client requests."
      />

      <ScheduleSectionCard
        title="Pending requests"
        subtitle="New requests waiting on your response."
      >
        {pendingRequests.length === 0 ? (
          <ScheduleEmptyState
            title="No pending requests"
            description="You’re all caught up for now."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {pendingRequests.map((req) => (
              <VStack key={req.id} align="stretch" spacing={3}>
                <ScheduleDateTimeCard
                  title={req.client_display_name || `Client #${req.client}`}
                  start={req.slot_start_time}
                  end={req.slot_end_time}
                  rightSlot={<ScheduleStatusBadge status={req.status} label={req.status_label} />}
                />
                {req.message_from_client ? (
                  <Text fontSize="sm" color="gray.600">
                    “{req.message_from_client}”
                  </Text>
                ) : null}
                <Textarea
                  placeholder="Optional note for the client..."
                  value={noteDrafts[req.id] || ""}
                  onChange={(event) =>
                    setNoteDrafts((prev) => ({ ...prev, [req.id]: event.target.value }))
                  }
                />
                <ScheduleActionBar>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    borderRadius="full"
                    onClick={() => handleConfirm(req.id)}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                    borderRadius="full"
                    onClick={() => handleDecline(req.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="ghost"
                    colorScheme="gray"
                    size="sm"
                    borderRadius="full"
                    onClick={() => handleCancel(req.id)}
                  >
                    Cancel request
                  </Button>
                </ScheduleActionBar>
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>

      <ScheduleSectionCard
        title="Recent updates"
        subtitle="Confirmed, declined, cancelled, or expired requests."
      >
        {otherRequests.length === 0 ? (
          <ScheduleEmptyState
            title="No recent updates"
            description="Past requests will appear here once processed."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {otherRequests.map((req) => (
              <VStack key={req.id} align="stretch" spacing={3}>
                <ScheduleDateTimeCard
                  title={req.client_display_name || `Client #${req.client}`}
                  start={req.slot_start_time}
                  end={req.slot_end_time}
                  rightSlot={<ScheduleStatusBadge status={req.status} label={req.status_label} />}
                />
                {req.message_from_client ? (
                  <Text fontSize="sm" color="gray.600">
                    “{req.message_from_client}”
                  </Text>
                ) : null}
                {req.therapist_response_note ? (
                  <Text fontSize="xs" color="gray.500">
                    Response note: {req.therapist_response_note}
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
