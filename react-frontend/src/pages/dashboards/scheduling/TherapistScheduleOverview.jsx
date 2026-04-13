import { useEffect, useMemo, useState } from "react";
import { Button, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { schedulingApi } from "../../../api/scheduling";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleDateTimeCard from "../../../components/scheduling/ScheduleDateTimeCard";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";
import { isUpcomingAppointment } from "../../../utils/scheduling";

const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export default function TherapistScheduleOverview({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [requestsData, appointmentsData] = await Promise.all([
        schedulingApi.listTherapistBookingRequests(),
        schedulingApi.listTherapistAppointments(),
      ]);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load scheduling overview."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = useMemo(
    () => requests.filter((req) => req.status === "pending"),
    [requests]
  );
  const todaysAppointments = useMemo(
    () => appointments.filter((appt) => isUpcomingAppointment(appt) && isToday(appt.start_time)),
    [appointments]
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter((appt) => isUpcomingAppointment(appt) && !isToday(appt.start_time)),
    [appointments]
  );

  if (loading) {
    return <ScheduleLoadingState label="Loading schedule…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadData} />;
  }

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Schedule Overview"
        subtitle="Quick look at today’s sessions, requests, and upcoming care."
        actions={
          <Button
            colorScheme="teal"
            borderRadius="full"
            onClick={() => onNavigate?.("availability")}
          >
            Add availability
          </Button>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <ScheduleSectionCard
          title="Pending requests"
          subtitle="Awaiting your confirmation"
          rightSlot={<ScheduleStatusBadge status="pending" />}
        >
          {pendingRequests.length === 0 ? (
            <ScheduleEmptyState
              title="No pending requests"
              description="New booking requests will appear here."
            />
          ) : (
            <VStack spacing={3} align="stretch">
              {pendingRequests.slice(0, 3).map((req) => (
                <ScheduleDateTimeCard
                  key={req.id}
                  title={req.client_display_name || `Client #${req.client}`}
                  start={req.slot_start_time}
                  end={req.slot_end_time}
                  rightSlot={<ScheduleStatusBadge status={req.status} label={req.status_label} />}
                />
              ))}
              {pendingRequests.length > 3 ? (
                <Text fontSize="sm" color="gray.500">
                  +{pendingRequests.length - 3} more pending requests
                </Text>
              ) : null}
              <Button
                variant="outline"
                borderRadius="full"
                size="sm"
                onClick={() => onNavigate?.("bookingRequests")}
              >
                Review requests
              </Button>
            </VStack>
          )}
        </ScheduleSectionCard>

        <ScheduleSectionCard
          title="Today"
          subtitle="Your scheduled sessions"
          rightSlot={<ScheduleStatusBadge status="scheduled" />}
        >
          {todaysAppointments.length === 0 ? (
            <ScheduleEmptyState
              title="No sessions today"
              description="You can open new slots or catch up on notes."
            />
          ) : (
            <VStack spacing={3} align="stretch">
              {todaysAppointments.map((appt) => (
                <ScheduleDateTimeCard
                  key={appt.id}
                  title={appt.client_display_name || `Client #${appt.client}`}
                  start={appt.start_time}
                  end={appt.end_time}
                  rightSlot={<ScheduleStatusBadge status={appt.status} label={appt.status_label} />}
                />
              ))}
            </VStack>
          )}
        </ScheduleSectionCard>
      </SimpleGrid>

      <ScheduleSectionCard
        title="Upcoming appointments"
        subtitle="Confirmed sessions beyond today"
      >
        {upcomingAppointments.length === 0 ? (
          <ScheduleEmptyState
            title="No upcoming appointments"
            description="Once you confirm a request, it will appear here."
          />
        ) : (
          <VStack spacing={3} align="stretch">
            {upcomingAppointments.slice(0, 5).map((appt) => (
              <ScheduleDateTimeCard
                key={appt.id}
                title={appt.client_display_name || `Client #${appt.client}`}
                start={appt.start_time}
                end={appt.end_time}
                rightSlot={<ScheduleStatusBadge status={appt.status} label={appt.status_label} />}
              />
            ))}
            {upcomingAppointments.length > 5 ? (
              <Text fontSize="sm" color="gray.500">
                +{upcomingAppointments.length - 5} more upcoming sessions
              </Text>
            ) : null}
            <Button
              variant="outline"
              borderRadius="full"
              size="sm"
              onClick={() => onNavigate?.("appointments")}
            >
              View all appointments
            </Button>
          </VStack>
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
