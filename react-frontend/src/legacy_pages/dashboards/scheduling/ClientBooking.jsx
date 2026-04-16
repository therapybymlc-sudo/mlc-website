import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  HStack,
  Input,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
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

export default function ClientBooking() {
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFirstSessionFree, setIsFirstSessionFree] = useState(false);
  const [needsTermination, setNeedsTermination] = useState(false);
  const toast = useToast();

  const loadTherapists = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listTherapistsPublic();
      setTherapists(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load therapists."));
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (therapistId) => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listPublicSlots(therapistId);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load availability."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  const therapistName = useMemo(() => {
    if (!selectedTherapist) return "";
    return selectedTherapist.name || selectedTherapist.title || "Therapist";
  }, [selectedTherapist]);

  const handleSelectTherapist = async (therapist) => {
    setSelectedTherapist(therapist);
    setSelectedSlot(null);
    setMessage("");
    await loadSlots(therapist.id);
  };

  const handleSubmit = async () => {
    if (!selectedTherapist || !selectedSlot) return;
    try {
      setLoading(true);
      setError("");
      setNeedsTermination(false);
      await schedulingApi.createBookingRequest({
        therapist: selectedTherapist.id,
        availability_slot: selectedSlot.id,
        message_from_client: message || undefined,
        is_first_session_free: isFirstSessionFree,
      });
      setSelectedSlot(null);
      setMessage("");
      setIsFirstSessionFree(false);
      toast({
        title: "Request Sent",
        description: "Your booking request has been submitted.",
        status: "success",
        duration: 4000,
      });
      await loadSlots(selectedTherapist.id);
    } catch (err) {
      const errMsg = err?.response?.data?.detail || err?.message || "";
      if (typeof errMsg === "string" && errMsg.toLowerCase().includes("terminate")) {
        setNeedsTermination(true);
        setError("You must terminate your existing therapeutic relationship before booking with a new therapist.");
      } else {
        setError(getSchedulingErrorMessage(err, "Unable to submit booking request."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateRelationship = async () => {
    try {
      setLoading(true);
      await schedulingApi.terminateRelationship();
      setNeedsTermination(false);
      setError("");
      toast({
        title: "Relationship terminated",
        description: "You may now book with a new therapist.",
        status: "success",
      });
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Failed to terminate relationship."));
    } finally {
      setLoading(false);
    }
  };

  if (loading && therapists.length === 0 && !selectedTherapist) {
    return <ScheduleLoadingState label="Loading therapists…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadTherapists} />;
  }

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Book a session"
        subtitle="Choose a therapist and request a time that works for you."
      />

      {!selectedTherapist ? (
        <ScheduleSectionCard
          title="Available therapists"
          subtitle="Select the therapist you’d like to book with."
        >
          {therapists.length === 0 ? (
            <ScheduleEmptyState
              title="No therapists available"
              description="Please check back soon for availability."
            />
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {therapists.map((therapist) => (
                <VStack
                  key={therapist.id}
                  align="start"
                  spacing={2}
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="gray.50"
                >
                  <Text fontWeight="semibold">{therapist.name}</Text>
                  {therapist.title ? (
                    <Text fontSize="sm" color="gray.600">
                      {therapist.title}
                    </Text>
                  ) : null}
                  {therapist.specialties ? (
                    <Text fontSize="xs" color="gray.500">
                      {therapist.specialties}
                    </Text>
                  ) : null}
                  <Button
                    size="sm"
                    borderRadius="full"
                    colorScheme="teal"
                    onClick={() => handleSelectTherapist(therapist)}
                  >
                    View open slots
                  </Button>
                </VStack>
              ))}
            </SimpleGrid>
          )}
        </ScheduleSectionCard>
      ) : (
        <VStack align="stretch" spacing={6}>
          <ScheduleSectionCard
            title={therapistName}
            subtitle="Choose a slot and send a request."
            rightSlot={
              <Button size="sm" variant="ghost" onClick={() => setSelectedTherapist(null)}>
                Back to therapists
              </Button>
            }
          >
            {slots.length === 0 ? (
              <ScheduleEmptyState
                title="No open slots"
                description="This therapist has no availability right now."
              />
            ) : (
              <VStack spacing={3} align="stretch">
                {slots.map((slot) => (
                  <HStack
                    key={slot.id}
                    spacing={3}
                    align="flex-start"
                    borderRadius="xl"
                    p={3}
                    border="1px solid"
                    borderColor={selectedSlot?.id === slot.id ? "teal.200" : "gray.100"}
                    bg={selectedSlot?.id === slot.id ? "teal.50" : "gray.50"}
                    onClick={() => setSelectedSlot(slot)}
                    cursor="pointer"
                  >
                    <ScheduleDateTimeCard
                      title={slot.therapist_display_name || therapistName}
                      start={slot.start_time}
                      end={slot.end_time}
                      rightSlot={<ScheduleStatusBadge status="open" label={slot.status_label} />}
                    />
                  </HStack>
                ))}
              </VStack>
            )}
          </ScheduleSectionCard>

          {selectedSlot ? (
            <ScheduleSectionCard
              title="Request this time"
              subtitle="Add an optional note for your therapist."
            >
              <VStack align="stretch" spacing={3}>
                <Textarea
                  placeholder="Share anything helpful about this request…"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <Checkbox
                  isChecked={isFirstSessionFree}
                  onChange={(e) => setIsFirstSessionFree(e.target.checked)}
                >
                  Request one-time 30-min Free First Session
                </Checkbox>
                <ScheduleActionBar>
                  {needsTermination ? (
                    <Button colorScheme="red" borderRadius="full" onClick={handleTerminateRelationship} isLoading={loading}>
                      Terminate Current Relationship
                    </Button>
                  ) : (
                    <Button colorScheme="teal" borderRadius="full" onClick={handleSubmit} isLoading={loading}>
                      Submit booking request
                    </Button>
                  )}
                  <Button variant="ghost" borderRadius="full" onClick={() => setSelectedSlot(null)}>
                    Choose a different slot
                  </Button>
                </ScheduleActionBar>
              </VStack>
            </ScheduleSectionCard>
          ) : (
            <ScheduleSectionCard
              title="Select a slot"
              subtitle="Tap a time above to send a booking request."
            >
              <ScheduleEmptyState
                title="No slot selected"
                description="Choose a time to continue."
              />
            </ScheduleSectionCard>
          )}
        </VStack>
      )}
    </VStack>
  );
}
